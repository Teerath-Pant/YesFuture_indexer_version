import { MatrixGridXThree } from "@/components/matrix-grid";
import { type LevelData } from "@/components/matrix-level-card";
import { ProgramPageHeader } from "@/components/programe-page-header";
import DataTable, { type Column } from "../data-table";
import { RefreshCw, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchSponsorIncomeHistory,
  fetchTotalSponsorIncome,
  fetchSponsorPackageAndIdWithMax,
  fetchSponsorRecycleCounts,
  fetchDirectPartners,
  fetchSponsorHeldSummary,
} from "@/lib/auth-api";
import { ethers } from "ethers";
import { RootID, sponsorMagicPackages } from "@/constants/programs";

interface pageProps {
  program?: string;
  accentColor?: string;
}

interface TransactionRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "recycle";
  recycleCount?: number;
  amount: string;
}

const SponserMagic = ({ program }: pageProps) => {
  const [, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [userStringId, setUserStringId] = useState("Loading...");
  const [data, setData] = useState<TransactionRow[]>([]);
  const [totalIncome, setTotalIncome] = useState<string>("0");
  const [activeLevelsCount, setActiveLevelsCount] = useState(0);
  const [totalLevelsCount] = useState(9);
  const [levelsData, setLevelsData] = useState<LevelData[]>([]);

  // Generate exactly 5 slots for Sponsor Magic (5-cycle system)
  const generateSlots = (partnersCount: number): ("direct" | "empty")[] => {
    const slots: ("direct" | "empty")[] = [];
    const totalSlots = 5;
    // const activeDotsCount = partnersCount > 0 && partnersCount % 5 === 0 ? 5 : (partnersCount % 5);
    const activeDotsCount = partnersCount % 5;
    for (let i = 0; i < totalSlots; i++) {
      if (i < activeDotsCount) {
        slots.push("direct");
      } else {
        slots.push("empty");
      }
    }

    return slots;
  };

  const getPackageLevelFromAmount = (amountStr: string): number => {
    const numericAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) return 1;

    const packagePrices = [
      12.525, 25.05, 50.1, 100.2, 200.4, 400.8, 801.6, 1603.2, 3206.4,
    ];
    const foundIndex = packagePrices.findIndex(
      (price) => Math.abs(price - numericAmount) < 0.05,
    );
    return foundIndex !== -1 ? foundIndex + 1 : 1;
  };

  // ✅ FIXED: Build levels data package-wise for Sponsor Magic
  const buildLevelsData = (
    currentPkg: number,
    transactionData: TransactionRow[],
    isRootUser = false,
    recycleCounts: Record<number, number> = {},
    childAheadTiers: Set<number> = new Set(),
    heldByPackage: Record<number, string[]> = {},
  ): LevelData[] => {
    // Sponsor Magic package prices (Direct Income portion)
    const packagePrices = sponsorMagicPackages;
    const levels: LevelData[] = [];

    // Count unique referrers per package. NOTE: recycle count is NOT derived
    // from here — item.cycle is DirectIncome's within-batch position (1..4,
    // "this was the Nth paid referral"), not a count of completed recycles.
    // With 2 partners that's cycle=2, which used to get shown as "2 cycles"
    // when zero recycles had happened. Real recycle count comes from
    // recycleCounts (SponsorReEntry events), fetched separately below.
    const levelReferrers: { [key: number]: Set<string> } = {};

    transactionData.forEach((item) => {
      const level = item.level;
      if (!levelReferrers[level]) {
        levelReferrers[level] = new Set();
      }
      levelReferrers[level].add(item.refId);
    });

    // Referrals #3/#4 of a batch don't always get paid immediately (see
    // SponsorIncomeHeld) — their DirectIncome row just doesn't exist yet, so
    // they were invisible here even though they're real direct partners.
    // Same fix as the per-level detail page.
    for (const [pkg, ids] of Object.entries(heldByPackage)) {
      const level = Number(pkg);
      if (!levelReferrers[level]) levelReferrers[level] = new Set();
      for (const id of ids) levelReferrers[level].add(id.replace(/^ID\s*/i, ""));
    }

    for (let i = 1; i <= 9; i++) {
      const isUnlocked = isRootUser || i <= currentPkg;
      const price = packagePrices[i - 1] || 0;
      const partnersCount = levelReferrers[i]?.size || 0;
      const cyclesCount = recycleCounts[i] || 0;

      // Generate 5 slots based on partners count for package level i
      const slots = generateSlots(partnersCount);

      levels.push({
        level: i,
        price: price,
        isUnlocked: isUnlocked,
        slots: slots,
        partnersCount: partnersCount,
        recycleCount: cyclesCount,
        isFreeze: isRootUser ? false : !isUnlocked,
        // A direct child bought this tier before the current user did — real
        // signal (child's actual sponsorPackageId), not a guessed tier-distance.
        isDamage: isRootUser ? false : childAheadTiers.has(i),
      });
    }

    return levels;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!window.ethereum) {
          setError("Please install MetaMask");
          setLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length === 0) {
          setError("Please connect your wallet");
          setLoading(false);
          return;
        }

        const walletAddress = accounts[0].address;
        // console.log("🔑 Wallet Address:", walletAddress);

        let pkgId = 1;
        let isRootUser = false;
        try {
          const pkgData = await fetchSponsorPackageAndIdWithMax(walletAddress);
          setUserStringId(pkgData.stringId || "ID ...");
          const cleanStrId = (pkgData.stringId || "")
            .replace(/^ID\s*/i, "")
            .trim()
            .toUpperCase();
          isRootUser =
            !!pkgData.isRoot ||
            pkgData.numericId === "1" ||
            cleanStrId === RootID ||
            cleanStrId === "1";
          pkgId = isRootUser ? 9 : pkgData.pkgId || 1;
          setActiveLevelsCount(pkgId);
          // console.log("📛 User String ID:", pkgData.stringId);
          // console.log("📦 Current Package:", pkgId);
        } catch (err) {
          // console.warn("Could not fetch member string ID:", err);
          setUserStringId("ID ...");
        }

        // ✅ Fetch ONLY Sponsor Income data
        const [history, total, recycleCounts, directPartners, heldByPackage] = await Promise.all([
          fetchSponsorIncomeHistory(walletAddress),
          fetchTotalSponsorIncome(walletAddress),
          fetchSponsorRecycleCounts(walletAddress),
          fetchDirectPartners(walletAddress),
          fetchSponsorHeldSummary(walletAddress),
        ]);

        // Tiers above the current user's own sponsor package that at least
        // one direct child has already reached.
        const childAheadTiers = new Set<number>();
        for (const p of directPartners) {
          for (let t = pkgId + 1; t <= p.x3; t++) childAheadTiers.add(t);
        }

        // console.log("📊 Sponsor History:", history);
        // console.log("💰 Total Sponsor Income:", total);

        const formattedData: TransactionRow[] = history.map((item, index) => {
          return {
            id: index + 1,
            date: item.date || "Pending",
            refId: item.childId.replace("ID ", ""),
            level: item.packageId || getPackageLevelFromAmount(item.amount),
            wallet: item.childId,
            fullWallet: "",
            type: "join",
            recycleCount: item.cycle || 0,
            amount: item.amount,
          };
        });

        // Transaction table shows only the current (highest unlocked)
        // package's income — the package grid above already breaks totals
        // down per level, this table shouldn't re-mix every level together.
        setData(formattedData.filter((row) => row.level === pkgId));
        setTotalIncome(total);

        const levels = buildLevelsData(pkgId, formattedData, isRootUser, recycleCounts, childAheadTiers, heldByPackage);
        setLevelsData(levels);
        // console.log("✅ Levels data:", levels);
        // console.log("✅ Levels data:", levels);
      } catch (err) {
        // console.error("❌ Failed to load sponsor income data:", err);
        setError("Failed to load income data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getRowIcon = (row: TransactionRow) => (
    <>
      {row.type === "recycle" ? (
        <RefreshCw size={16} className="text-green-500" />
      ) : (
        <User size={16} className="text-gray-300" />
      )}
      {row.type === "recycle" && row.recycleCount != null && (
        <span className="absolute -top-1 -right-1 text-[10px] leading-none text-green-400 font-semibold">
          {row.recycleCount}
        </span>
      )}
    </>
  );

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    // {
    //   key: "refId",
    //   label: "ID",
    //   render: (r) => (
    //     <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
    //       ID {r.refId}
    //     </span>
    //   ),
    // },
    { key: "level", label: "Package" },
    {
      key: "wallet",
      label: "Income From",
      render: (r) => <span className="text-white">{r.wallet}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (r) => (
        <span
          className={
            r.type === "recycle" ? "text-green-500" : "text-white font-medium"
          }
        >
          {r.amount}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="w-full text-white">
        <div className="flex h-64 w-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
          <span className="ml-2 text-gray-400">Loading Sponsor Income...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userStringId.replace("ID ", "")}
        programName={program || "Sponsor Magic"}
        activeLevelsCount={activeLevelsCount}
        totalLevelsCount={totalLevelsCount}
        totalProfit={`${totalIncome} USDT`}
      />

      <MatrixGridXThree levels={levelsData} />

      <div className="my-8">
        <DataTable<TransactionRow>
          columns={columns}
          data={data}
          getRowIcon={getRowIcon}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default SponserMagic;
