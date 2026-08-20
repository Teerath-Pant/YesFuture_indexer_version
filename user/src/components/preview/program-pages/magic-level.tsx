import { type LevelData } from "../magic-level/magic-level-card";
import { ProgramPageHeader } from "@/components/programe-page-header";
// import DataTable, { type Column } from "@/components/data-table";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
// import {
//   PreviewModeApiCall,
//   fetchSponsorIncomeHistory,
//   fetchTotalSponsorIncome,
//   fetchSponsorPackageAndIdWithMax,
// } from "@/lib/auth-api";
import {
  PreviewModeApiCall,
  fetchLevelIncomeHistory,
  fetchUserTotalLevelProfit,
  fetchLevelPackageAndIdWithMax,
} from "@/lib/auth-api";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  magicLevelPackages,
  RootID,
  sponsorMagicPackages,
} from "@/constants/programs";
import { PreviewMagicLevel } from "../magic-level/magic-level-grid";

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

const PreviewUserMagicLevels = ({ program }: pageProps) => {
  // const [, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [userStringId, setUserStringId] = useState("Loading...");
  const [_data, setData] = useState<TransactionRow[]>([]);
  const [totalIncome, setTotalIncome] = useState<string>("0");
  const [activeLevelsCount, setActiveLevelsCount] = useState(0);
  const [totalLevelsCount] = useState(9);
  const [levelsData, setLevelsData] = useState<LevelData[]>([]);

  const { id } = useSearch({ from: "/preview" });

  // const getPackageLevelFromAmount = (amountStr: string): number => {
  //   const numericAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
  //   if (isNaN(numericAmount) || numericAmount <= 0) return 1;

  //   const packagePrices = sponsorMagicPackages;
  //   const foundIndex = packagePrices.findIndex(
  //     (price) => Math.abs(price - numericAmount) < 0.05
  //   );
  //   return foundIndex !== -1 ? foundIndex + 1 : 1;
  // };

  // const buildLevelsData = (currentPkg: number, transactionData: TransactionRow[], isRootUser = false): LevelData[] => {
  //   const packagePrices = magicLevelPackages;
  //   const levels: LevelData[] = [];

  //   const levelReferrers: { [key: number]: Set<string> } = {};
  //   const levelTotalAmount: { [key: number]: number } = {};

  //   transactionData.forEach((item) => {
  //     const level = item.level;
  //     if (!levelReferrers[level]) {
  //       levelReferrers[level] = new Set();
  //       levelTotalAmount[level] = 0;
  //     }
  //     levelReferrers[level].add(item.refId);

  //     const numericAmount = parseFloat(item.amount.replace(/[^0-9.]/g, "")) || 0;
  //     levelTotalAmount[level] += numericAmount;
  //   });

  //   for (let i = 1; i <= 9; i++) {
  //     const isUnlocked = isRootUser || i <= currentPkg;
  //     const price = packagePrices[i - 1] || 0;
  //     // const partnersCount = levelReferrers[i]?.size || 0;
  //     const totalAmount = levelTotalAmount[i] || 0;

  //     levels.push({
  //       level: i,
  //       price: price,
  //       isUnlocked: isUnlocked,
  //       totalAmount: totalAmount,
  //       isFreeze: isRootUser ? false : !isUnlocked,
  //       isDamage: isRootUser ? false : i > currentPkg + 1,
  //     });
  //   }

  //   return levels;
  // };

  const buildLevelsData = (
    currentPkg: number,
    transactionData: TransactionRow[],
    isRootUser = false,
  ): LevelData[] => {
    const packagePrices = magicLevelPackages;
    const levels: LevelData[] = [];

    const levelReferrers: { [key: number]: Set<string> } = {};
    const levelTotalAmount: { [key: number]: number } = {};

    transactionData.forEach((item) => {
      const level = item.level;
      if (!levelReferrers[level]) {
        levelReferrers[level] = new Set();
        levelTotalAmount[level] = 0;
      }
      levelReferrers[level].add(item.refId);

      const numericAmount =
        parseFloat(item.amount.replace(/[^0-9.]/g, "")) || 0;
      levelTotalAmount[level] += numericAmount;
    });

    for (let i = 1; i <= 9; i++) {
      const isUnlocked = isRootUser || i <= currentPkg;
      const price = packagePrices[i - 1] || 0;
      // const partnersCount = levelReferrers[i]?.size || 0;
      const totalAmount = levelTotalAmount[i] || 0;

      levels.push({
        level: i,
        price: price,
        isUnlocked: isUnlocked,
        totalAmount: totalAmount,
        isFreeze: isRootUser ? false : !isUnlocked,
        isDamage: isRootUser ? false : i > currentPkg + 1,
      });
    }

    return levels;
  };

  // useEffect(() => {
  //   async function loadData() {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       if (!id) {
  //         throw new Error("No user ID provided in the search parameters.");
  //       }
  //       const userId = id;

  //       let pkgId = 1;
  //       let isRootUser = false;
  //       try {
  //         const pkgData = await PreviewModeApiCall(
  //           userId,
  //           fetchSponsorPackageAndIdWithMax,
  //         );
  //         setUserStringId(pkgData?.stringId || "ID ...");
  //         const cleanStrId = (pkgData?.stringId || "")
  //           .replace(/^ID\s*/i, "")
  //           .trim()
  //           .toUpperCase();
  //         const cleanParamId = (userId || "")
  //           .replace(/^ID\s*/i, "")
  //           .trim()
  //           .toUpperCase();
  //         isRootUser =
  //           !!pkgData?.isRoot ||
  //           pkgData?.numericId === "1" ||
  //           cleanStrId === RootID ||
  //           cleanStrId === "1" ||
  //           cleanParamId === RootID ||
  //           cleanParamId === "1";
  //         pkgId = isRootUser ? 9 : pkgData?.pkgId || 1;
  //         setActiveLevelsCount(pkgId);
  //       } catch (err) {
  //         toast.error("Could not fetch member string ID");
  //         setUserStringId("ID ...");
  //       }

  //       const [history, total] = await Promise.all([
  //         PreviewModeApiCall(userId, fetchSponsorIncomeHistory),
  //         PreviewModeApiCall(userId, fetchTotalSponsorIncome),
  //       ]);

  //       const safeHistory = history ?? [];
  //       const safeTotal = total ?? "0";

  //       const formattedData: TransactionRow[] = safeHistory.map(
  //         (item, index) => {
  //           const pkgLevel = getPackageLevelFromAmount(item.amount);
  //           return {
  //             id: index + 1,
  //             date: item.date || "Pending",
  //             refId: item.childId.replace("ID ", ""),
  //             level: pkgLevel,
  //             wallet: item.childId,
  //             fullWallet: "",
  //             type: "join",
  //             recycleCount: item.cycle || 0,
  //             amount: item.amount,
  //           };
  //         },
  //       );

  //       setData(formattedData);
  //       setTotalIncome(safeTotal);

  //       const levels = buildLevelsData(pkgId, formattedData, isRootUser);
  //       setLevelsData(levels);
  //     } catch (err) {
  //       toast.error("❌ Failed to load sponsor income data:");
  //       setError("Failed to load income data. Please try again.");
  //       setUserStringId("ID ...");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   loadData();
  // }, [id]);

    useEffect(() => {
      async function loadData() {
        try {
          setLoading(true);
          setError(null);
  
          if (!id) {
            setLoading(false);
            return;
          }
  
          let pkgId = 1;
          let isRootUser = false;
          try {
            const pkgData = await PreviewModeApiCall(id,fetchLevelPackageAndIdWithMax);
            setUserStringId(pkgData?.stringId || "ID ...");
            const cleanStrId = (pkgData?.stringId || "")
              .replace(/^ID\s*/i, "")
              .trim()
              .toUpperCase();
            isRootUser =
              !!pkgData?.isRoot ||
              pkgData?.numericId === "1" ||
              cleanStrId === RootID ||
              cleanStrId === "1";
            pkgId = isRootUser ? 9 : pkgData?.pkgId || 1;
            setActiveLevelsCount(pkgId);
          } catch (err) {
            toast.error("Could not fetch member string ID");
            setUserStringId("ID ...");
          }
  
          const [history, total] = await Promise.all([
            PreviewModeApiCall(id,fetchLevelIncomeHistory),
            PreviewModeApiCall(id,fetchUserTotalLevelProfit),
          ]);
  
          const safeHistory = history ?? [];
          const safeTotal = total ?? "0";
  
          const formattedData: TransactionRow[] = safeHistory.map(
            (item, index) => {
              return {
                id: index + 1,
                date: item.date || "Pending",
                refId: item.childId.replace("ID ", ""),
                level: item.level,
                wallet: item.childId,
                fullWallet: "",
                type: "join",
                amount: item.amount,
              };
            },
          );
  
          setData(formattedData);
          setTotalIncome(safeTotal);
  
          const levels = buildLevelsData(pkgId, formattedData, isRootUser);
          setLevelsData(levels);
        } catch (err) {
          toast.error("❌ Failed to load level income data:");
          setError("Failed to load income data. Please try again.");
          setUserStringId("ID ...");
        } finally {
          setLoading(false);
        }
      }
  
      loadData();
    }, [id]);

  // const getRowIcon = (row: TransactionRow) => (
  //   <>
  //     {row.type === "recycle" ? (
  //       <RefreshCw size={16} className="text-green-500" />
  //     ) : (
  //       <User size={16} className="text-gray-300" />
  //     )}
  //     {row.type === "recycle" && row.recycleCount != null && (
  //       <span className="absolute -top-1 -right-1 text-[10px] leading-none text-green-400 font-semibold">
  //         {row.recycleCount}
  //       </span>
  //     )}
  //   </>
  // );

  // const columns: Column<TransactionRow>[] = [
  //   { key: "date", label: "Date" },
  //   { key: "level", label: "Level" },
  //   {
  //     key: "wallet",
  //     label: "Income From",
  //     render: (r) => <span className="text-white">{r.wallet}</span>,
  //   },
  //   {
  //     key: "amount",
  //     label: "Amount",
  //     align: "right",
  //     render: (r) => (
  //       <span
  //         className={
  //           r.type === "recycle" ? "text-green-500" : "text-white font-medium"
  //         }
  //       >
  //         {r.amount}
  //       </span>
  //     ),
  //   },
  // ];

  if (loading) {
    return (
      <div className="w-full text-white">
        <div className="flex h-64 w-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
          <span className="ml-2 text-gray-400">
            Loading Magic Level Income...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userStringId.replace("ID ", "")}
        programName={program || "Magic Level"}
        activeLevelsCount={activeLevelsCount}
        totalLevelsCount={totalLevelsCount}
        totalProfit={`${totalIncome} USDT`}
      />

      <PreviewMagicLevel levels={levelsData} />

      {/* <div className="my-8">
        <DataTable<TransactionRow>
          columns={columns}
          data={data}
          getRowIcon={getRowIcon}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div> */}
    </div>
  );
};

export default PreviewUserMagicLevels;
