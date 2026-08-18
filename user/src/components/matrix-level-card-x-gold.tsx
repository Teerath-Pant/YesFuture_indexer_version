// import { Users, RefreshCw, Wallet } from "lucide-react";
// import { useNavigate } from "@tanstack/react-router";
// import { normalizeTree } from "@/lib/utils";

// export type SlotType =
//   "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

// export interface LevelDataXGold {
//   level: number;
//   price: number;
//   isUnlocked: boolean;
//   tree: SlotType[][]; // Row 0: 2, Row 1: 4, Row 2: 8, Row 3: 16
//   partnersCount?: number;
//   recycleCount?: number;
//   revenue?: number;
//   isDamage?: boolean;
// }

// function slotColor(slot: SlotType, visible: boolean): string {
//   if (!visible) return "bg-white/10 border border-white/10";

//   switch (slot) {
//     case "direct":
//       return "bg-white shadow-sm";
//     case "spilloverAbove":
//       return "bg-yellow-300 shadow-sm";
//     case "spilloverBelow":
//       return "bg-orange-400 shadow-sm";
//     case "gift":
//       return "bg-cyan-300 shadow-sm";
//     case "empty":
//     default:
//       // Empty circles visual feedback improve karne ke liye opacity + subtle ring
//       return "bg-white/15 ring-1 ring-white/10";
//   }
// }

// // Fixed dimensions per row for precise sizing and alignment
// // const ROW_CONFIGS = [
// //   { size: "h-7 w-7", cols: "grid-cols-2 gap-8" }, // Level 1: 2 nodes
// //   { size: "h-5 w-5", cols: "grid-cols-4 gap-3" }, // Level 2: 4 nodes
// //   { size: "h-3 w-3", cols: "grid-cols-8 gap-1.5" }, // Level 3: 8 nodes
// //   { size: "h-2 w-2", cols: "grid-cols-16 gap-0.5" }, // Level 4: 16 nodes
// // ];

// export function MatrixLevelCardXGold({
//   level,
//   price,
//   isUnlocked,
//   tree,
//   partnersCount,
//   recycleCount,
//   revenue,
//   isDamage,
// }: LevelDataXGold) {
//   const navigate = useNavigate();
//   const normalizedTree = normalizeTree(tree);
//   const ROW_CONFIGS = [
//     { size: "w-6 h-6" }, // row 1 — 2 circles, sabse bade
//     { size: "w-5 h-5" }, // row 2 — 4 circles
//     { size: "w-4 h-4" }, // row 3 — 8 circles
//     { size: "w-3 h-3" }, // row 4 — 16 circles, sabse chhote
//   ];
//   return (
//     <div
//       onClick={() => {
//         if (!isUnlocked) return;
//         navigate({
//           to: "/dashboard/$program/$level",
//           params: { program: "magicGoldMatrix", level: String(level) },
//         });
//       }}
//       className={`relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 transition-all duration-200 select-none ${
//         isUnlocked
//           ? "bg-[#3865ff] text-white shadow-lg shadow-blue-500/20 hover:bg-[#325ce6]"
//           : isDamage
//             ? "bg-[#1b1d22] text-white border-2 border-rose-500/60 shadow-lg shadow-rose-500/20" // solid bg-rose-400 ki jagah border-only
//             : "bg-[#1b1d22] text-gray-400 border border-white/5"
//         // isUnlocked
//         //   ? "bg-[#3865ff] text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:bg-[#325ce6]"
//         //   : (isDamage? "bg-rose-400 text-white border border-white/5":"bg-[#1b1d22] text-gray-400 border border-white/5")
//       }`}
//     >
//       {/* Header: Level + Price */}
//       <div className="flex items-center justify-between text-xs font-bold">
//         {/* <span
//           className={
//             isUnlocked
//               ? "text-blue-100"
//               : isDamage
//                 ? "text-white"
//                 : "text-gray-400"
//           }
//         > */}
//         <span className={isUnlocked ? "text-blue-100" : (isDamage ? "text-rose-400 font-bold" : "text-gray-400")}>
//           Pkg {level}
//         </span>
//         <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full">
//           <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
//             $
//           </span>
//           <span
//             className={
//               isUnlocked ? "text-white font-extrabold" : "text-gray-300"
//             }
//           >
//             {price.toLocaleString()}
//           </span>
//         </div>
//       </div>

//       {/* Tree Visualization */}
//       {isUnlocked || isDamage || (partnersCount ?? 0) > 0 ? (
//         <>
//           <div className="my-3 flex flex-col items-center justify-center gap-2 z-10 w-full">
//             {normalizedTree.map((row, rowIdx) => {
//               const config =
//                 ROW_CONFIGS[Math.min(rowIdx, ROW_CONFIGS.length - 1)];

//               return (
//                 <div
//                   key={rowIdx}
//                   className="flex justify-around items-center w-full max-w-60"
//                 >
//                   {row.map((slot, slotIdx) => (
//                     <div
//                       key={slotIdx}
//                       className={`rounded-full border transition-all duration-200 ${config.size} ${slotColor(
//                         slot,
//                         isUnlocked || !!isDamage,
//                       )}`}
//                     />
//                   ))}
//                 </div>
//               );
//             })}
//           </div>
//           {/* Bottom Footer Stats */}
//           {/* <div className="flex items-center gap-4 text-xs font-semibold text-blue-100/90 z-10 pt-1"> */}
//           <div className={`flex items-center gap-4 text-xs font-semibold z-10 pt-1 ${isUnlocked ? "text-blue-100/90" : "text-rose-400"}`}>
//             <div className="flex items-center gap-1.5">
//               <Users className="h-4 w-4 opacity-80" />
//               <span>{partnersCount ?? 0}</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <RefreshCw className="h-4 w-4 opacity-80" />
//               {/* recycleCount counts placements (1 = no recycle yet) — cycles
//                   are displayed 0-indexed project-wide. */}
//               <span>{Math.max((recycleCount ?? 0) - 1, 0)}</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <Wallet className="h-4 w-4 opacity-80" />
//               <span>{(revenue ?? 0).toLocaleString()} USDT</span>
//             </div>
//           </div>
//         </>
//       ) : (
//         /* Lock Placeholder for Locked Levels */
//         <div className="my-8 flex flex-col items-center justify-center gap-2 opacity-20">
//           <div className="grid grid-cols-2 gap-6">
//             <div className="h-6 w-6 rounded-full border-2 border-white/40" />
//             <div className="h-6 w-6 rounded-full border-2 border-white/40" />
//           </div>
//           <div className="grid grid-cols-4 gap-3 mt-1">
//             <div className="h-4 w-4 rounded-full border border-white/30" />
//             <div className="h-4 w-4 rounded-full border border-white/30" />
//             <div className="h-4 w-4 rounded-full border border-white/30" />
//             <div className="h-4 w-4 rounded-full border border-white/30" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { Users, RefreshCw, Wallet } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { normalizeTree } from "@/lib/utils";

export type SlotType =
  "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

export interface LevelDataXGold {
  level: number;
  price: number;
  isUnlocked: boolean;
  tree: SlotType[][]; // Row 0: 2, Row 1: 4, Row 2: 8, Row 3: 16
  partnersCount?: number;
  recycleCount?: number;
  revenue?: number;
  isDamage?: boolean;
}

// function slotColor(slot: SlotType, visible: boolean): string {
//   if (!visible) return "bg-white/10 border border-white/10";

//   switch (slot) {
//     case "direct":
//       return "bg-white shadow-sm";
//     case "spilloverAbove":
//       return "bg-yellow-300 shadow-sm";
//     case "spilloverBelow":
//       return "bg-orange-400 shadow-sm";
//     case "gift":
//       return "bg-cyan-300 shadow-sm";
//     case "empty":
//     default:
//       // Empty circles visual feedback improve karne ke liye opacity + subtle ring
//       return "bg-white/15 ring-1 ring-white/10";
//   }
// }

function slotColor(slot: SlotType, isUnlocked: boolean, isDamage: boolean): string {
  // Locked but damaged (downline activity exists) — filled slots show red,
  // matching the card's red border. Direct/spillover distinction only
  // matters once the package itself is unlocked.
  if (!isUnlocked && isDamage) {
    if (slot === "empty") return "bg-white/15 ring-1 ring-white/10";
    return "bg-rose-500 shadow-sm shadow-rose-500/50";
  }

  if (!isUnlocked) return "bg-white/10 border border-white/10";

  switch (slot) {
    case "direct":
      return "bg-white shadow-sm";
    case "spilloverAbove":
      return "bg-yellow-300 shadow-sm";
    case "spilloverBelow":
      return "bg-orange-400 shadow-sm";
    case "gift":
      return "bg-cyan-300 shadow-sm";
    case "empty":
    default:
      return "bg-white/15 ring-1 ring-white/10";
  }
}

export function MatrixLevelCardXGold({
  level,
  price,
  isUnlocked,
  tree,
  partnersCount,
  recycleCount,
  revenue,
  isDamage,
}: LevelDataXGold) {
  const navigate = useNavigate();
  const normalizedTree = normalizeTree(tree);
  const ROW_CONFIGS = [
    { size: "w-6 h-6" }, // row 1 — 2 circles, sabse bade
    { size: "w-5 h-5" }, // row 2 — 4 circles
    { size: "w-4 h-4" }, // row 3 — 8 circles
    { size: "w-3 h-3" }, // row 4 — 16 circles, sabse chhote
  ];
  return (
    <div
      onClick={() => {
        if (!isUnlocked) return;
        navigate({
          to: "/dashboard/$program/$level",
          params: { program: "magicGoldMatrix", level: String(level) },
        });
      }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 transition-all duration-200 select-none ${
        isUnlocked
          ? "bg-[#3865ff] text-white shadow-lg shadow-blue-500/20 hover:bg-[#325ce6]"
          : isDamage
            ? "bg-[#1b1d22] text-white border-2 border-rose-500/60 shadow-lg shadow-rose-500/20"
            : "bg-[#1b1d22] text-gray-400 border border-white/5"
      }`}
    >
      {/* Header: Level + Price */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={isUnlocked ? "text-blue-100" : (isDamage ? "text-rose-400 font-bold" : "text-gray-400")}>
          Pkg {level}
        </span>
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
            $
          </span>
          <span
            className={
              isUnlocked ? "text-white font-extrabold" : "text-gray-300"
            }
          >
            {price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tree Visualization */}
      {isUnlocked || isDamage || (partnersCount ?? 0) > 0 ? (
        <>
          <div className="my-3 flex flex-col items-center justify-center gap-2 z-10 w-full">
            {normalizedTree.map((row, rowIdx) => {
              const config =
                ROW_CONFIGS[Math.min(rowIdx, ROW_CONFIGS.length - 1)];

              return (
                <div
                  key={rowIdx}
                  className="flex justify-around items-center w-full max-w-60"
                >
                  {row.map((slot, slotIdx) => (
                    <div
                      key={slotIdx}
                      className={`rounded-full border transition-all duration-200 ${config.size} ${slotColor(
                        slot,
                        isUnlocked , !!isDamage,
                      )}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          {/* Bottom Footer Stats */}
          <div className={`flex items-center gap-4 text-xs font-semibold z-10 pt-1 ${isUnlocked ? "text-blue-100/90" : "text-rose-400"}`}>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 opacity-80" />
              <span>{partnersCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 opacity-80" />
              {/* recycleCount counts placements (1 = no recycle yet) — cycles
                  are displayed 0-indexed project-wide. */}
              <span>{Math.max((recycleCount ?? 0) - 1, 0)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 opacity-80" />
              <span>{(revenue ?? 0).toLocaleString()} USDT</span>
            </div>
          </div>
        </>
      ) : (
        /* Lock Placeholder for Locked Levels */
        <div className="my-8 flex flex-col items-center justify-center gap-2 opacity-20">
          <div className="grid grid-cols-2 gap-6">
            <div className="h-6 w-6 rounded-full border-2 border-white/40" />
            <div className="h-6 w-6 rounded-full border-2 border-white/40" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-1">
            <div className="h-4 w-4 rounded-full border border-white/30" />
            <div className="h-4 w-4 rounded-full border border-white/30" />
            <div className="h-4 w-4 rounded-full border border-white/30" />
            <div className="h-4 w-4 rounded-full border border-white/30" />
          </div>
        </div>
      )}
    </div>
  );
}