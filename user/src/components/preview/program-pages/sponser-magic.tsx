// src/components/preview/program-pages/sponser-magic.tsx

import { type LevelData } from "@/components/matrix-level-card";
import { ProgramPageHeader } from "@/components/programe-page-header";
import DataTable, { type Column } from "@/components/data-table";
import { RefreshCw, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  PreviewModeApiCall,
  fetchSponsorIncomeHistory,
  fetchTotalSponsorIncome,
  fetchSponsorPackageAndIdWithMax,
  fetchSponsorRecycleCounts,
  fetchDirectPartners,
  fetchSponsorHeldSummary,
  fetchSponsorPartnersCounts,
} from "@/lib/auth-api";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { RootID, sponsorMagicPackages } from "@/constants/programs";
import { PreviewMatrixGridXThree } from "@/components/preview/sponsor-magic/matrix-grid";

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

const PreviewUserSponserMagic = ({ program }: pageProps) => {
  const [, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [userStringId, setUserStringId] = useState("Loading...");
  const [data, setData] = useState<TransactionRow[]>([]);
  const [totalIncome, setTotalIncome] = useState<string>("0");
  const [activeLevelsCount, setActiveLevelsCount] = useState(0);
  const [totalLevelsCount] = useState(9);
  const [levelsData, setLevelsData] = useState<LevelData[]>([]);

  const { id } = useSearch({ from: "/preview" });

  // Generate exactly 5 slots with explicit type definitions.
  // Generate exactly 5 slots with explicit type definitions.
  const generateSlots = (
    _level: number,
    partnersCount: number,
  ): ("direct" | "gift" | "empty" | "cross")[] => {
    const slots: ("direct" | "gift" | "empty" | "cross")[] = [];
    const totalSlots = 5;
    const activeDotsCount = partnersCount > 0 && partnersCount % 5 === 0 ? 5 : (partnersCount % 5);

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

    const packagePrices = sponsorMagicPackages;
    const foundIndex = packagePrices.findIndex(
      (price) => Math.abs(price - numericAmount) < 0.05
    );
    return foundIndex !== -1 ? foundIndex + 1 : 1;
  };

  // Build levels data package-wise for Sponsor Magic — mirrors the live
  // program-pages/sponser-magic.tsx (see there for the full reasoning):
  // recycle count comes from real SponsorReEntry events (not a tx-count
  // heuristic), partner count includes held (not-yet-paid) referrals and is
  // scoped to the current open cycle, and isDamage reflects a real direct
  // child's live sponsorPackageId instead of a guessed tier distance.
  const buildLevelsData = (
    currentPkg: number,
    transactionData: TransactionRow[],
    isRootUser = false,
    recycleCounts: Record<number, number> = {},
    childAheadCounts: Record<number, number> = {},
    heldByPackage: Record<number, string[]> = {},
    partnersCounts: Record<number, number> = {},
  ): LevelData[] => {
    // Sponsor Magic package prices (Direct Income portion)
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
      for (const idStr of ids) levelReferrers[level].add(idStr.replace(/^ID\s*/i, ""));
    }

    for (let i = 1; i <= 9; i++) {
      const isUnlocked = isRootUser || i <= currentPkg;
      const price = packagePrices[i - 1] || 0;
      const cyclesCount = recycleCounts[i] || 0;
      const totalVisible = levelReferrers[i]?.size || 0;
      const currentCyclePartnersCount = Math.max(totalVisible - 4 * cyclesCount, 0);
      // Real total across every cycle, straight from DB — includes each
      // completed cycle's invisible 5th slot, which the client-side
      // reconstruction above structurally can't see. Falls back to the
      // reconstructed total if the DB-backed count isn't available.
      const totalPartnersCount = partnersCounts[i] ?? totalVisible + cyclesCount;

      // Generate 5 slots based on the CURRENT cycle's partner count
      const slots = generateSlots(i, currentCyclePartnersCount);

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

        if (!id) {
          throw new Error("No user ID provided in the search parameters.");
        }
        const userId = id;

        let pkgId = 1;
        let isRootUser = false;
        try {
          const pkgData = await PreviewModeApiCall(
            userId,
            fetchSponsorPackageAndIdWithMax,
          );
          setUserStringId(pkgData?.stringId || "ID ...");
          const cleanStrId = (pkgData?.stringId || "").replace(/^ID\s*/i, "").trim().toUpperCase();
          const cleanParamId = (userId || "").replace(/^ID\s*/i, "").trim().toUpperCase();
          isRootUser = !!pkgData?.isRoot || pkgData?.numericId === "1" || cleanStrId === RootID || cleanStrId === "1" || cleanParamId === RootID || cleanParamId === "1";
          pkgId = isRootUser ? 9 : (pkgData?.pkgId || 1);
          setActiveLevelsCount(pkgId);
        } catch (err) {
          toast.error("Could not fetch member string ID");
          setUserStringId("ID ...");
        }

        const [history, total, recycleCounts, directPartners, heldByPackage, partnersCounts] = await Promise.all([
          PreviewModeApiCall(userId, fetchSponsorIncomeHistory),
          PreviewModeApiCall(userId, fetchTotalSponsorIncome),
          PreviewModeApiCall(userId, fetchSponsorRecycleCounts),
          PreviewModeApiCall(userId, fetchDirectPartners),
          PreviewModeApiCall(userId, fetchSponsorHeldSummary),
          PreviewModeApiCall(userId, fetchSponsorPartnersCounts),
        ]);

        const safeHistory = history ?? [];
        const safeTotal = total ?? "0";
        const safeRecycleCounts = recycleCounts ?? {};
        const safeDirectPartners = directPartners ?? [];
        const safeHeldByPackage = heldByPackage ?? {};
        const safePartnersCounts = partnersCounts ?? {};

        // Per tier above the current user's own sponsor package, how many
        // direct children have already reached it.
        const childAheadCounts: Record<number, number> = {};
        for (const p of safeDirectPartners) {
          for (let t = pkgId + 1; t <= p.x3; t++) {
            childAheadCounts[t] = (childAheadCounts[t] || 0) + 1;
          }
        }

        const formattedData: TransactionRow[] = safeHistory.map(
          (item, index) => {
            const pkgLevel = getPackageLevelFromAmount(item.amount);
            return {
              id: index + 1,
              date: item.date || "Pending",
              refId: item.childId.replace("ID ", ""),
              level: pkgLevel,
              wallet: item.childId,
              fullWallet: "",
              type: "join",
              recycleCount: item.cycle || 0,
              amount: item.amount,
            };
          },
        );

        setData(formattedData);
        setTotalIncome(safeTotal);

        const levels = buildLevelsData(pkgId, formattedData, isRootUser, safeRecycleCounts, childAheadCounts, safeHeldByPackage, safePartnersCounts);
        setLevelsData(levels);
      } catch (err) {
        toast.error("❌ Failed to load sponsor income data:");
        setError("Failed to load income data. Please try again.");
        setUserStringId("ID ...");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

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
            r.type === "recycle" ? "text-green-400 font-semibold" : "text-green-400 font-semibold"
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

      <PreviewMatrixGridXThree levels={levelsData} />

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

export default PreviewUserSponserMagic;
