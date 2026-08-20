import { MatrixGridXThree } from "@/components/matrix-grid";
import { type LevelData } from "@/components/matrix-level-card";
import { ProgramPageHeader } from "@/components/programe-page-header";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchSponsorIncomeHistory,
  fetchTotalSponsorIncome,
  fetchSponsorPackageAndIdWithMax,
  fetchSponsorRecycleCounts,
  fetchSponsorPartnersCounts,
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
  // const [, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [userStringId, setUserStringId] = useState("Loading...");
  // const [data, setData] = useState<TransactionRow[]>([]);
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
    childAheadCounts: Record<number, number> = {},
    heldByPackage: Record<number, string[]> = {},
    partnersCounts: Record<number, number> = {},
  ): LevelData[] => {
    const packagePrices = sponsorMagicPackages;
    const levels: LevelData[] = [];
    const levelReferrers: { [key: number]: Set<string> } = {};

    transactionData.forEach((item) => {
      const level = item.level;
      if (!levelReferrers[level]) {
        levelReferrers[level] = new Set();
      }
      levelReferrers[level].add(item.refId);
    });
    for (const [pkg, ids] of Object.entries(heldByPackage)) {
      const level = Number(pkg);
      if (!levelReferrers[level]) levelReferrers[level] = new Set();
      for (const id of ids)
        levelReferrers[level].add(id.replace(/^ID\s*/i, ""));
    }

    for (let i = 1; i <= 9; i++) {
      const isUnlocked = isRootUser || i <= currentPkg;
      const price = packagePrices[i - 1] || 0;
      const cyclesCount = recycleCounts[i] || 0;
      const totalVisible = levelReferrers[i]?.size || 0;
      const currentCyclePartnersCount = Math.max(totalVisible - 4 * cyclesCount, 0);
      // Label shown on the card is the real total across every cycle,
      // straight from DB (package_purchase_events) — includes each
      // completed cycle's invisible 5th slot, which the client-side
      // DirectIncome/held reconstruction above structurally can't see.
      const totalPartnersCount = partnersCounts[i] ?? totalVisible + cyclesCount;

      // Generate 5 slots based on the CURRENT cycle's partner count
      const slots = generateSlots(currentCyclePartnersCount);

      levels.push({
        level: i,
        price: price,
        isUnlocked: isUnlocked,
        slots: slots,
        partnersCount: totalPartnersCount,
        recycleCount: cyclesCount,
        isFreeze: isRootUser ? false : !isUnlocked,
        isDamage: isRootUser ? false : (childAheadCounts[i] || 0) > 0,
        missedPartnersCount: childAheadCounts[i] || 0,
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
        } catch (err) {
          setUserStringId("ID ...");
        }

        // ✅ Fetch ONLY Sponsor Income data
        const [history, total, recycleCounts, directPartners, heldByPackage, partnersCounts] = await Promise.all([
          fetchSponsorIncomeHistory(walletAddress),
          fetchTotalSponsorIncome(walletAddress),
          fetchSponsorRecycleCounts(walletAddress),
          fetchDirectPartners(walletAddress),
          fetchSponsorHeldSummary(walletAddress),
          fetchSponsorPartnersCounts(walletAddress),
        ]);

        // Per tier above the current user's own sponsor package, how many
        // direct children have already reached it.
        const childAheadCounts: Record<number, number> = {};
        for (const p of directPartners) {
          for (let t = pkgId + 1; t <= p.x3; t++) {
            childAheadCounts[t] = (childAheadCounts[t] || 0) + 1;
          }
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
        setTotalIncome(total);

        const levels = buildLevelsData(pkgId, formattedData, isRootUser, recycleCounts, childAheadCounts, heldByPackage, partnersCounts);
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
    </div>
  );
};

export default SponserMagic;
