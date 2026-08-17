// // import { RefreshCw, User } from "lucide-react";
// // import DataTable, { type Column } from "@/components/data-table";
// // import WalletCell from "@/components/wallet-cell";
// // import LevelPageLayout from "@/components/level-page-layout";
// // import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
// // import { useState, useEffect } from "react";
// // import {
// //   fetchSponsorLevelDetail,
// //   type SponsorLevelDetail,
// //   type SponsorLevelTransaction,
// // } from "@/lib/auth-api";
// // import { ethers } from "ethers";
// // import { magicLevelPackages } from "@/constants/programs";
// // import PreviewMagicLevelSummaryCard from "@/components/preview/magic-level-summary-card";

// // const SPONSOR_PACKAGE_PRICES = magicLevelPackages;
// // const MAX_LEVEL = 9;

// // export const PreviewMagicLevelPackagePage = ({
// //   level,
// //   program,
// // }: {
// //   level: string;
// //   program: string;
// // }) => {
// //   const navigate = useNavigate();
// //   const [levelNum, setLevelNum] = useState<number>(0);
// //   const isNavigating = useRouterState().status === "pending";
// //   const search: Record<string, string> = useSearch({ strict: false }) || {};
// //   const searchId = search.id;

// //   const [loading, setLoading] = useState(true);
// //   const [detail, setDetail] = useState<SponsorLevelDetail | null>(null);
// //   const [_page, setPage] = useState(1);

// //   useEffect(() => {
// //     let isMounted = true;

// //     async function loadData() {
// //       try {
// //         setLoading(true);
// //         let targetUserOrAddress = searchId;

// //         if (!targetUserOrAddress) {
// //           if (window.ethereum) {
// //             try {
// //               const provider = new ethers.BrowserProvider(window.ethereum);
// //               const accounts = await provider.listAccounts();
// //               if (accounts.length > 0) {
// //                 targetUserOrAddress = accounts[0].address;
// //               }
// //             } catch (e) {
// //               console.warn("Wallet read error in XThreeLevelPage:", e);
// //             }
// //           }
// //         }

// //         if (!targetUserOrAddress) {
// //           if (isMounted) setLoading(false);
// //           return;
// //         }

// //         const res = await fetchSponsorLevelDetail(
// //           targetUserOrAddress,
// //           levelNum,
// //         );

// //         if (isMounted && res) {
// //           setDetail(res);
// //         }
// //       } catch (err) {
// //         console.error("Error loading sponsor level detail:", err);
// //       } finally {
// //         if (isMounted) setLoading(false);
// //       }
// //     }

// //     loadData();

// //     return () => {
// //       isMounted = false;
// //     };
// //   }, [levelNum, searchId]);

// //   const ownIdClean =
// //     detail?.ownStringId && detail.ownStringId !== "..."
// //       ? detail.ownStringId.replace(/^ID\s*/i, "")
// //       : searchId
// //         ? searchId.replace(/^ID\s*/i, "")
// //         : "...";

// //   const uplineIdClean = detail?.uplineStringId || "NONE";
// //   const uplineDisplay =
// //     uplineIdClean === "NONE"
// //       ? "NONE"
// //       : uplineIdClean.startsWith("ID")
// //         ? uplineIdClean
// //         : `ID ${uplineIdClean}`;

// //   const coinValue = SPONSOR_PACKAGE_PRICES[levelNum - 1] || levelNum;

// //   const getRowIcon = (row: SponsorLevelTransaction) => (
// //     <>
// //       {row.type === "recycle" ? (
// //         <RefreshCw size={16} className="text-green-500" />
// //       ) : (
// //         <User size={16} className="text-gray-300" />
// //       )}
// //       {row.type === "recycle" && row.recycleCount != null && (
// //         <span className="absolute -top-1 -right-1 text-[10px] leading-none text-green-400 font-semibold">
// //           {row.recycleCount}
// //         </span>
// //       )}
// //     </>
// //   );

// //   const columns: Column<SponsorLevelTransaction>[] = [
// //     { key: "date", label: "Date" },
// //     {
// //       key: "refId",
// //       label: "ID",
// //       render: (r) => (
// //         <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs font-mono">
// //           ID {r.refId}
// //         </span>
// //       ),
// //     },
// //     {
// //       key: "wallet",
// //       label: "Wallet",
// //       render: (r) => (
// //         <WalletCell
// //           address={r.fullWallet || r.wallet}
// //           displayAddress={r.wallet}
// //           explorerUrl={
// //             r.fullWallet && r.fullWallet.startsWith("0x")
// //               ? `https://bscscan.com/address/${r.fullWallet}`
// //               : undefined
// //           }
// //         />
// //       ),
// //     },
// //     {
// //       key: "amount",
// //       label: "USDT",
// //       align: "right",
// //       render: (r) => (
// //         <span
// //           className={
// //             r.type === "recycle"
// //               ? "text-green-400 font-semibold"
// //               : "text-white font-medium"
// //           }
// //         >
// //           {r.amount}
// //         </span>
// //       ),
// //     },
// //   ];

// //   if (loading) {
// //     return (
// //       <div className="w-full text-white flex flex-col items-center justify-center h-64 gap-3">
// //         <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
// //         <span className="text-gray-400 text-sm">
// //           Loading Sponsor Level Structure...
// //         </span>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="w-full text-white">
// //       <LevelPageLayout
// //         breadcrumb={[
// //           { label: `ID ${ownIdClean}` },
// //           { label: program },
// //           { label: `Package ${level}` },
// //         ]}
// //         title={`Package ${level}`}
// //         uplineId={uplineDisplay}
// //         isLoading={isNavigating}
// //         level={{
// //           current: levelNum,
// //           totalLevels: MAX_LEVEL,
// //           hasPrev: levelNum > 1,
// //           hasNext: levelNum < MAX_LEVEL,
// //           onPrev: () => {
// //             setLevelNum((prev) => Math.max(1, prev - 1));
// //             navigate({
// //               to: `/preview/dashboard/${program}/${level}`,
// //               search: { id: searchId, level: levelNum - 1 },
// //             });
// //           },
// //           onNext: () => {
// //             setLevelNum((prev) => Math.min(MAX_LEVEL, prev + 1));
// //             navigate({
// //               to: `/preview/dashboard/${program}/${level}`,
// //               search: { id: searchId, level: levelNum + 1 },
// //             });
// //           },
// //         }}
// //       >
// //         <PreviewMagicLevelSummaryCard
// //           level={levelNum}
// //           id={ownIdClean}
// //           coinCount={coinValue}
// //           partnersCount={detail?.partnersCount || 0}
// //           totalRevenue={`${detail?.totalRevenue || "0"} USDT`}
// //         />
// //       </LevelPageLayout>
// //       <div className="my-8">
// //         <DataTable<SponsorLevelTransaction>
// //           columns={columns}
// //           data={detail?.transactions || []}
// //           getRowIcon={getRowIcon}
// //           getRowKey={(row) => row.id}
// //           onSeeMore={() => setPage((p) => p + 1)}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default PreviewMagicLevelPackagePage;

// import { RefreshCw } from "lucide-react";
// import DataTable, { type Column } from "@/components/data-table";
// import LevelPageLayout from "@/components/level-page-layout";
// import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
// import { useState, useEffect } from "react";
// import {
//   fetchSponsorLevelDetail,
//   type SponsorLevelDetail,
// } from "@/lib/auth-api";
// import { ethers } from "ethers";
// import { magicLevelPackages, type ProgramTypes } from "@/constants/programs";
// import PreviewMagicLevelSummaryCard from "@/components/preview/magic-level-summary-card";

// const SPONSOR_PACKAGE_PRICES = magicLevelPackages;
// const MAX_PACKAGE = 9;

// interface LevelSummaryRow {
//   id: number;       // getRowKey ke liye
//   level: number;
//   idCount: number;  // us level ke partners/IDs ka count
//   income: string;   // USDT me income
// }

// export const PreviewMagicLevelPackagePage = ({
//   level,
//   program,
// }: {
//   level: string;
//   program: ProgramTypes;
// }) => {
//   const navigate = useNavigate();
//   const packageNum = Number(level) || 1; // 👈 URL hi single source of truth
//   const isNavigating = useRouterState().status === "pending";
//   const search: Record<string, string> = useSearch({ strict: false }) || {};
//   const searchId = search.id;

//   const [loading, setLoading] = useState(true);
//   const [detail, setDetail] = useState<SponsorLevelDetail | null>(null);
//   const [levelRows, setLevelRows] = useState<LevelSummaryRow[]>([]);

//   useEffect(() => {
//     let isMounted = true;

//     async function loadData() {
//       try {
//         setLoading(true);
//         let targetUserOrAddress = searchId;

//         if (!targetUserOrAddress) {
//           if (window.ethereum) {
//             try {
//               const provider = new ethers.BrowserProvider(window.ethereum);
//               const accounts = await provider.listAccounts();
//               if (accounts.length > 0) {
//                 targetUserOrAddress = accounts[0].address;
//               }
//             } catch (e) {
//               console.warn("Wallet read error in XThreeLevelPage:", e);
//             }
//           }
//         }

//         if (!targetUserOrAddress) {
//           if (isMounted) setLoading(false);
//           return;
//         }

//         const res = await fetchSponsorLevelDetail(
//           targetUserOrAddress,
//           packageNum,
//         );

//         if (!isMounted) return;

//         if (res) {
//           setDetail(res);
//         }

//         // TODO: yahan asli per-level breakdown API call lagao (package = packageNum ke andar 10 levels)
//         // Example: const breakdown = await fetchSponsorLevelBreakdown(targetUserOrAddress, packageNum);
//         // Har level ka { level, idCount, income } honi chahiye

//         // Placeholder — real API response se replace karo
//         const rows: LevelSummaryRow[] = Array.from(
//           { length: 10 },
//           (_, i) => ({
//             id: i + 1,
//             level: i + 1,
//             idCount: 0,   // 👈 real data se bharo
//             income: "0",  // 👈 real data se bharo
//           }),
//         );

//         setLevelRows(rows);
//       } catch (err) {
//         console.error("Error loading sponsor level detail:", err);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     }

//     loadData();

//     return () => {
//       isMounted = false;
//     };
//   }, [packageNum, searchId]);

//   const ownIdClean =
//     detail?.ownStringId && detail.ownStringId !== "..."
//       ? detail.ownStringId.replace(/^ID\s*/i, "")
//       : searchId
//         ? searchId.replace(/^ID\s*/i, "")
//         : "...";

//   const uplineIdClean = detail?.uplineStringId || "NONE";
//   const uplineDisplay =
//     uplineIdClean === "NONE"
//       ? "NONE"
//       : uplineIdClean.startsWith("ID")
//         ? uplineIdClean
//         : `ID ${uplineIdClean}`;

//   const coinValue = SPONSOR_PACKAGE_PRICES[packageNum - 1] || packageNum;

//   const columns: Column<LevelSummaryRow>[] = [
//     { key: "level", label: "Level" },
//     { key: "idCount", label: "ID Count", align: "center" },
//     {
//       key: "income",
//       label: "Income (USDT)",
//       align: "right",
//       render: (r) => (
//         <span className="text-white font-medium">{r.income} USDT</span>
//       ),
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="w-full text-white flex flex-col items-center justify-center h-64 gap-3">
//         <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
//         <span className="text-gray-400 text-sm">
//           Loading Sponsor Level Structure...
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full text-white">
//       <LevelPageLayout
//         breadcrumb={[
//           { label: `ID ${ownIdClean}` },
//           { label: program },
//           { label: `Package ${packageNum}` },
//         ]}
//         title={`Package ${packageNum}`}
//         uplineId={uplineDisplay}
//         isLoading={isNavigating}
//         package={{
//           current: packageNum,
//           totalPackages: MAX_PACKAGE,
//           hasPrev: packageNum > 1,
//           hasNext: packageNum < MAX_PACKAGE,
//           onPrev: () =>
//             navigate({
//               to: "/preview/dashboard/$program/$level",
//               params: { program, level: String(packageNum - 1) },
//               search: { id: searchId },
//             }),
//           onNext: () =>
//             navigate({
//               to: "/preview/dashboard/$program/$level",
//               params: { program, level: String(packageNum + 1) },
//               search: { id: searchId },
//             }),
//         }}
//         program={program}
//       >
//         <PreviewMagicLevelSummaryCard
//           level={packageNum}
//           id={ownIdClean}
//           coinCount={coinValue}
//           partnersCount={detail?.partnersCount || 0}
//           totalRevenue={`${detail?.totalRevenue || "0"} USDT`}
//         />
//       </LevelPageLayout>

//       <div className="my-8">
//         <DataTable<LevelSummaryRow>
//           columns={columns}
//           data={levelRows}
//           getRowKey={(row) => row.id}
//           pageSize={10}
//         />
//       </div>
//     </div>
//   );
// };

// export default PreviewMagicLevelPackagePage;

import { RefreshCw } from "lucide-react";
import DataTable, { type Column } from "@/components/data-table";
import LevelPageLayout from "@/components/level-page-layout";
import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { magicLevelPackages, type ProgramTypes } from "@/constants/programs";
import MagicLevelSummaryCard from "../magic-level-summary-card";
import { useEffect, useState } from "react";
import {
  fetchTeamLevelByDepth,
  fetchUserLevelIncomeForLevel,
  fetchUserStringId,
  PreviewModeApiCall,
} from "@/lib/auth-api";
import WalletCell from "@/components/wallet-cell";

const SPONSOR_PACKAGE_PRICES = magicLevelPackages;
const MAX_LEVEL = 10; // team-level pagination ki upper limit

interface TeamMemberRow {
  id: number;
  stringId: string;
  wallet: string;
  fullWallet: string;
  joinDate: string;
}

export const MagicLevelPackagePage = ({
  level,
  program,
}: {
  level: string;
  program: ProgramTypes;
}) => {
  const navigate = useNavigate();
  const { id: userId } = useSearch({ from: "/preview" });
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState("0 USDT");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [uplineId, setUplineId] = useState("NONE");
  // const [isLoading, setIsLoading] = useState(false);
  // const [userId, setUserId] = useState("");
  const packageNum = Number(level) || 1;
  const isNavigating = useRouterState().status === "pending";
  const search: Record<string, string> = useSearch({ strict: false }) || {};
  const currentTeamLevel = Math.min(
    MAX_LEVEL,
    Math.max(1, Number(search.level) || 1),
  );

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      if (!userId) {
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      try {
        const [depthResult, levelIncomeRaw] = await Promise.all([
          // PreviewModeApiCall(userId,fetchUserStringId),
          PreviewModeApiCall(userId, fetchTeamLevelByDepth, currentTeamLevel),
          PreviewModeApiCall(
            userId,
            fetchUserLevelIncomeForLevel,
            currentTeamLevel,
          ),
        ]);

        if (!isCancelled && depthResult) {
          // setUserId(user_id);
          setUplineId(depthResult.uplineStringId);

          const matched = depthResult.rows.filter(
            (row) => row.packageId === packageNum,
          );

          const rows: TeamMemberRow[] = matched.map((row) => ({
            id: row.id,
            stringId: row.refId,
            wallet: row.wallet,
            fullWallet: row.fullWallet,
            joinDate: row.date,
          }));

          setTeamMembers(rows);
          setTotalRevenue(`${Number(levelIncomeRaw).toFixed(3)} USDT`);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!isCancelled) setIsDataLoading(false);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [userId, currentTeamLevel, packageNum]);

  const coinValue = SPONSOR_PACKAGE_PRICES[packageNum - 1] || packageNum;

  // const columns: Column<TeamMemberRow>[] = [
  //   { key: "stringId", label: "ID" },
  //   {
  //     key: "wallet",
  //     label: "Wallet Address",
  //     render: (r) => (
  //       <span className="text-sm text-gray-300" title={r.fullWallet}>
  //         {r.wallet}
  //       </span>
  //     ),
  //   },
  //   { key: "joinDate", label: "Join Date", align: "right" },
  // ];

  const columns: Column<TeamMemberRow>[] = [
    { key: "stringId", label: "ID" },
    {
      key: "wallet",
      label: "Wallet Address",
      render: (r) => (
        // <span className="text-sm text-gray-300" title={r.fullWallet}>
        //   {r.wallet}
        // </span>
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    { key: "joinDate", label: "Join Date", align: "right" },
  ];

  const goToLevel = (nextLevel: number) => {
    navigate({
      to: "/preview/dashboard/$program/$level",
      params: { program, level: level },
      search: (prev) => ({ ...prev, level: nextLevel }),
    });
  };

  // if (isLoading) {
  //   return (
  //     <div className="w-full text-white flex flex-col items-center justify-center h-64 gap-3">
  //       <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
  //       <span className="text-gray-400 text-sm">
  //         Loading team level structure...
  //       </span>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full text-white">
      <LevelPageLayout
        breadcrumb={[
          { label: `ID ${userId || "..."}` },
          { label: program },
          { label: `Package ${packageNum}` }, // 👈 package number, prop se
        ]}
        title={`Level ${currentTeamLevel}`} // 👈 title ab level pagination dikhata hai
        uplineId={uplineId}
        isLoading={isDataLoading}
        package={{
          current: currentTeamLevel,
          totalPackages: MAX_LEVEL,
          hasPrev: currentTeamLevel > 1,
          hasNext: currentTeamLevel < MAX_LEVEL,
          onPrev: () => goToLevel(currentTeamLevel - 1),
          onNext: () => goToLevel(currentTeamLevel + 1),
        }}
        program={program}
      >
        <MagicLevelSummaryCard
          level={currentTeamLevel}
          id={userId ?? ""}
          coinCount={coinValue}
          partnersCount={teamMembers.length}
          totalRevenue="0 USDT"
        />
      </LevelPageLayout>

      <div className="my-8">
        <DataTable<TeamMemberRow>
          columns={columns}
          data={teamMembers}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default MagicLevelPackagePage;
