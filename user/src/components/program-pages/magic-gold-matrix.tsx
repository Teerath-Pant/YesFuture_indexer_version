// import { MatrixGridXGold } from "@/components/matrix-grid-x-gold";
// import { type LevelDataXGold } from "@/components/matrix-level-card-x-gold";
// import { ProgramPageHeader } from "@/components/programe-page-header";
// import DataTable, { type Column } from "../data-table";
// import WalletCell from "../wallet-cell";
// import { RefreshCw, User } from "lucide-react";
// import { useState, useEffect } from "react";
// import {
//   magicGoldMatrixPackages,
//   type ProgramTypes,
// } from "@/constants/programs";
// import {
//   fetchPackageAndId,
//   fetchPurchaseHistory,
//   fetchMagicGoldMatrixSummary,
//   fetchMaxActivePackage,
// } from "@/lib/auth-api";
// import { useWallet } from "@/lib/use-wallet";

// interface pageProps {
//   program?: ProgramTypes;
//   accentColor?: string;
//   walletAddress?: string;
// }

// interface TransactionRow {
//   id: number;
//   date: string;
//   refId: string;
//   level: number;
//   wallet: string;
//   fullWallet?: string;
//   type: "join" | "recycle";
//   recycleCount?: number;
//   amount: string;
// }

// const MagicGoldMatrix = ({ program, walletAddress }: pageProps) => {
//   const { address } = useWallet();
//   const activeWalletAddress = walletAddress || address;
//   const [_page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [userNumericId, setUserNumericId] = useState("0");
//   const [maxActivePkg, setMaxActivePkg] = useState(1);
//   const [purchaseHistory, setPurchaseHistory] = useState<TransactionRow[]>([]);
//   const [packageMetrics, setPackageMetrics] = useState<
//     Record<
//       number,
//       {
//         partnersCount: number;
//         level5Count: number;
//         recycleCount: number;
//         tree?: LevelDataXGold["tree"];
//         revenue?: number;
//       }
//     >
//   >({});
//   const [totalRevenue, setTotalRevenue] = useState(0);

//   const packagePrices = magicGoldMatrixPackages; // Assuming this is defined elsewhere in your code

//   useEffect(() => {
//     async function loadAllData() {
//       if (!activeWalletAddress) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         // 1. Get user numeric ID & max active package directly from contract mapping
//         const { numericId, stringId } =
//           await fetchPackageAndId(activeWalletAddress);
//         setUserNumericId(stringId);

//         const activeMax = await fetchMaxActivePackage(activeWalletAddress);
//         // Ensure at least package 1 is active if they are registered
//         setMaxActivePkg(Math.max(activeMax, 1));

//         // 2. Fetch specific matrix metrics + income for each package tier up to maxActivePkg
//         // — one batched backend call for all 9 tiers instead of 9 x 4 requests
//         // (that many concurrent fetches still queued behind the browser's
//         // ~6-per-origin connection cap even when fired via Promise.all).
//         const unlockedMax = Math.max(activeMax, 1);
//         // const summary = await fetchMagicGoldMatrixSummary(activeWalletAddress);
//         // const metricsMap: Record<number, any> = {};
//         // let allTimeRevenue = 0;
//         // for (let i = 1; i <= 9; i++) {
//         //   const details = i <= unlockedMax
//         //     ? (summary[i] ?? { partnersCount: 0, level5Count: 0, recycleCount: 0, revenue: 0 })
//         //     : { partnersCount: 0, level5Count: 0, recycleCount: 0, revenue: 0 };
//         //   metricsMap[i] = details;
//         //   allTimeRevenue += details.revenue ?? 0;
//         // }
//         const summary = await fetchMagicGoldMatrixSummary(activeWalletAddress);
//         const metricsMap: Record<number, any> = {};
//         let allTimeRevenue = 0;
//         for (let i = 1; i <= 9; i++) {
//           const details = summary[i] ?? {
//             partnersCount: 0,
//             level5Count: 0,
//             recycleCount: 0,
//             tree: [],
//             revenue: 0,
//           };
//           metricsMap[i] = details;
//           if (i <= unlockedMax) {
//             allTimeRevenue += details.revenue ?? 0;
//           }
//         }
//         setPackageMetrics(metricsMap);
//         setTotalRevenue(allTimeRevenue);

//         // 3. Fetch History Logs. fetchPurchaseHistory returns every track (LEVEL/
//         // SPONSOR/MATRIX) — this page is Matrix-only, and the table shows the
//         // current (highest unlocked) package's purchase, not every package mixed.
//         const historyData = await fetchPurchaseHistory(activeWalletAddress);
//         const currentPkg = Math.max(activeMax, 1);
//         const formattedHistory: TransactionRow[] = historyData
//           .filter(
//             (item: any) =>
//               item.track === "MATRIX" && Number(item.packageId) === currentPkg,
//           )
//           .map((item: any, idx: number) => ({
//             id: idx + 1,
//             date: item.date,
//             refId: numericId,
//             level: Number(item.packageId) || 1,
//             wallet: `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`,
//             fullWallet: activeWalletAddress,
//             type: "join",
//             amount: item.amount,
//           }));
//         setPurchaseHistory(formattedHistory);
//       } catch (err) {
//         console.error("Error loading matrix block data:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadAllData();
//   }, [activeWalletAddress]);

//   // Dynamically generate the 9 levels matching your smart contract structure
//   const levelsData: LevelDataXGold[] = packagePrices.map((price, index) => {
//     const pkgLevel = index + 1;
//     // Explicitly check if package level is less than or equal to maxActivePkg fetched from contract
//     const isUnlocked = pkgLevel <= maxActivePkg;
//     const metrics = packageMetrics[pkgLevel] || {
//       partnersCount: 0,
//       level5Count: 0,
//       recycleCount: 0,
//       tree: [],
//     };

//     const hasDownlinePurchasedUpper =
//       !isUnlocked &&
//       ((metrics.partnersCount ?? 0) > 0 ||
//         (metrics.level5Count ?? 0) > 0 ||
//         (metrics.revenue ?? 0) > 0);

//     const generateSlots = (startIndex: number, totalSlots: number) => {
//       const slots: string[] = [];
//       for (let s = 0; s < totalSlots; s++) {
//         const globalSlotIndex = startIndex + s;
//         slots.push(globalSlotIndex < metrics.level5Count ? "direct" : "empty");
//       }
//       return slots;
//     };

//     return {
//       level: pkgLevel,
//       price: price,
//       isUnlocked: isUnlocked,
//       partnersCount: metrics.partnersCount,
//       recycleCount: metrics.recycleCount,
//       revenue: metrics.revenue,
//       isDamage: hasDownlinePurchasedUpper,
//       tree: metrics.tree && metrics.tree.length > 0 ? metrics.tree : [],
//       // isDamage: !isUnlocked,
//       // tree: isUnlocked
//       //   ? metrics.tree && metrics.tree.length > 0
//       //     ? metrics.tree
//       //     : [
//       //         generateSlots(0, 2),
//       //         generateSlots(2, 4),
//       //         generateSlots(6, 8),
//       //         generateSlots(14, 18),
//       //       ]
//       //   : [],
//     } as LevelDataXGold;
//   });

//   const getRowIcon = (row: TransactionRow) => (
//     <>
//       {row.type === "recycle" ? (
//         <RefreshCw size={16} className="text-green-500" />
//       ) : (
//         <User size={16} className="text-gray-300" />
//       )}
//     </>
//   );

//   const columns: Column<TransactionRow>[] = [
//     { key: "date", label: "Date" },
//     {
//       key: "refId",
//       label: "ID",
//       render: (r) => (
//         <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
//           ID {r.refId}
//         </span>
//       ),
//     },
//     { key: "level", label: "Package Level" },
//     {
//       key: "wallet",
//       label: "Wallet",
//       render: (r) => (
//         <WalletCell
//           address={r.fullWallet ?? r.wallet}
//           displayAddress={r.wallet}
//           explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
//         />
//       ),
//     },
//     {
//       key: "amount",
//       label: "USDT",
//       align: "right",
//       render: (r) => <span className="text-white">{r.amount}</span>,
//     },
//   ];

//   return (
//     <div className="w-full text-white">
//       <ProgramPageHeader
//         userId={userNumericId}
//         programName={program}
//         activeLevelsCount={maxActivePkg}
//         totalLevelsCount={9}
//         totalProfit={`${totalRevenue.toLocaleString()} USDT`}
//       />

//       {loading ? (
//         <div className="flex justify-center items-center py-20 text-indigo-400">
//           <RefreshCw className="animate-spin mr-2" /> Loading independent
//           package matrices...
//         </div>
//       ) : (
//         <>
//           <MatrixGridXGold levels={levelsData} />

//           <div className="my-8">
//             <DataTable<TransactionRow>
//               columns={columns}
//               data={purchaseHistory}
//               getRowIcon={getRowIcon}
//               getRowKey={(row) => row.id}
//               pageSize={10}
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default MagicGoldMatrix;


import { MatrixGridXGold } from "@/components/matrix-grid-x-gold";
import { type LevelDataXGold } from "@/components/matrix-level-card-x-gold";
import { ProgramPageHeader } from "@/components/programe-page-header";
import DataTable, { type Column } from "../data-table";
import WalletCell from "../wallet-cell";
import { RefreshCw, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  magicGoldMatrixPackages,
  type ProgramTypes,
} from "@/constants/programs";
import {
  fetchPackageAndId,
  fetchPurchaseHistory,
  fetchMagicGoldMatrixSummary,
  fetchMaxActivePackage,
} from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";

interface pageProps {
  program?: ProgramTypes;
  accentColor?: string;
  walletAddress?: string;
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

const MagicGoldMatrix = ({ program, walletAddress }: pageProps) => {
  const { address } = useWallet();
  const activeWalletAddress = walletAddress || address;
  const [_page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userNumericId, setUserNumericId] = useState("0");
  const [maxActivePkg, setMaxActivePkg] = useState(1);
  const [purchaseHistory, setPurchaseHistory] = useState<TransactionRow[]>([]);
  // const [packageMetrics, setPackageMetrics] = useState
  //   <Record
  //     number,
  //     {
  //       partnersCount: number;
  //       level5Count: number;
  //       recycleCount: number;
  //       tree?: LevelDataXGold["tree"];
  //       revenue?: number;
  //     }
  //   >
  // >({});
  const [packageMetrics, setPackageMetrics] = useState<
  Record<
    number,
    {
      partnersCount: number;
      level5Count: number;
      recycleCount: number;
      tree?: LevelDataXGold["tree"];
      revenue?: number;
    }
  >
>({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const packagePrices = magicGoldMatrixPackages; // Assuming this is defined elsewhere in your code

  useEffect(() => {
    async function loadAllData() {
      if (!activeWalletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Get user numeric ID & max active package directly from contract mapping
        const { numericId, stringId } =
          await fetchPackageAndId(activeWalletAddress);
        setUserNumericId(stringId);

        const activeMax = await fetchMaxActivePackage(activeWalletAddress);
        // Ensure at least package 1 is active if they are registered
        setMaxActivePkg(Math.max(activeMax, 1));

        // 2. Fetch specific matrix metrics + income for each package tier
        // — one batched backend call for all 9 tiers instead of 9 x 4 requests
        // (that many concurrent fetches still queued behind the browser's
        // ~6-per-origin connection cap even when fired via Promise.all).
        // NOTE: metricsMap holds data for ALL 9 packages, including locked
        // ones — locked-package data is what powers the isDamage (red card)
        // detection below. Only totalRevenue is capped to unlocked packages.
        const unlockedMax = Math.max(activeMax, 1);
        const summary = await fetchMagicGoldMatrixSummary(activeWalletAddress);
        const metricsMap: Record<number, any> = {};
        let allTimeRevenue = 0;
        for (let i = 1; i <= 9; i++) {
          const details = summary[i] ?? {
            partnersCount: 0,
            level5Count: 0,
            recycleCount: 0,
            tree: [],
            revenue: 0,
          };
          metricsMap[i] = details;
          if (i <= unlockedMax) {
            allTimeRevenue += details.revenue ?? 0;
          }
        }
        setPackageMetrics(metricsMap);
        setTotalRevenue(allTimeRevenue);

        // 3. Fetch History Logs. fetchPurchaseHistory returns every track (LEVEL/
        // SPONSOR/MATRIX) — this page is Matrix-only, and the table shows the
        // current (highest unlocked) package's purchase, not every package mixed.
        const historyData = await fetchPurchaseHistory(activeWalletAddress);
        const currentPkg = Math.max(activeMax, 1);
        const formattedHistory: TransactionRow[] = historyData
          .filter(
            (item: any) =>
              item.track === "MATRIX" && Number(item.packageId) === currentPkg,
          )
          .map((item: any, idx: number) => ({
            id: idx + 1,
            date: item.date,
            refId: numericId,
            level: Number(item.packageId) || 1,
            wallet: `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`,
            fullWallet: activeWalletAddress,
            type: "join",
            amount: item.amount,
          }));
        setPurchaseHistory(formattedHistory);
      } catch (err) {
        console.error("Error loading matrix block data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [activeWalletAddress]);

  // Dynamically generate the 9 levels matching your smart contract structure
  const levelsData: LevelDataXGold[] = packagePrices.map((price, index) => {
    const pkgLevel = index + 1;
    // Explicitly check if package level is less than or equal to maxActivePkg fetched from contract
    const isUnlocked = pkgLevel <= maxActivePkg;
    const metrics = packageMetrics[pkgLevel] || {
      partnersCount: 0,
      level5Count: 0,
      recycleCount: 0,
      tree: [],
    };

    // A locked package's card turns red when the downline has already
    // generated activity on it (placement, level-5 fill, or income) even
    // though the logged-in user hasn't purchased/unlocked it themselves.
    const hasDownlinePurchasedUpper =
      !isUnlocked &&
      ((metrics.partnersCount ?? 0) > 0 ||
        (metrics.level5Count ?? 0) > 0 ||
        (metrics.revenue ?? 0) > 0);

    return {
      level: pkgLevel,
      price: price,
      isUnlocked: isUnlocked,
      partnersCount: metrics.partnersCount,
      recycleCount: metrics.recycleCount,
      revenue: metrics.revenue,
      isDamage: hasDownlinePurchasedUpper,
      tree: metrics.tree && metrics.tree.length > 0 ? metrics.tree : [],
    } as LevelDataXGold;
  });

  const getRowIcon = (row: TransactionRow) => (
    <>
      {row.type === "recycle" ? (
        <RefreshCw size={16} className="text-green-500" />
      ) : (
        <User size={16} className="text-gray-300" />
      )}
    </>
  );

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
          ID {r.refId}
        </span>
      ),
    },
    { key: "level", label: "Package Level" },
    {
      key: "wallet",
      label: "Wallet",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    {
      key: "amount",
      label: "USDT",
      align: "right",
      render: (r) => <span className="text-white">{r.amount}</span>,
    },
  ];

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userNumericId}
        programName={program}
        activeLevelsCount={maxActivePkg}
        totalLevelsCount={9}
        totalProfit={`${totalRevenue.toLocaleString()} USDT`}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading independent
          package matrices...
        </div>
      ) : (
        <>
          <MatrixGridXGold levels={levelsData} />

          {/* <div className="my-8">
            <DataTable<TransactionRow>
              columns={columns}
              data={purchaseHistory}
              getRowIcon={getRowIcon}
              getRowKey={(row) => row.id}
              pageSize={10}
            />
          </div> */}
        </>
      )}
    </div>
  );
};

export default MagicGoldMatrix;