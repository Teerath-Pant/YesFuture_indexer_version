// import { Users, RefreshCw } from "lucide-react";
// import { useNavigate } from "@tanstack/react-router";

// export type SlotType = "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

// export interface LevelDataXGold {
//   level: number;
//   price: number;
//   isUnlocked: boolean;
//   // each sub-array is one row of circles; row 0 (top) is biggest and always 2 slots,
//   // every row after that can have any number of slots and renders smaller than the one before it
//   tree: SlotType[][];
//   partnersCount?: number;
//   recycleCount?: number;
// }

// function slotColor(slot: SlotType, isUnlocked: boolean): string {
//   if (!isUnlocked) return "bg-white/5";
//   switch (slot) {
//     case "direct":
//       return "bg-white shadow-sm";
//     case "spilloverAbove":
//       return "bg-yellow-300 shadow-sm";
//     case "spilloverBelow":
//       return "bg-orange-400 shadow-sm";
//     case "gift":
//       return "bg-cyan-300 shadow-sm";
//     default:
//       return "bg-white/20"; // empty = faded white
//   }
// }

// // row 0 = biggest circles, each following row renders a size smaller
// const ROW_SIZES = [
//   "h-7 w-7",
//   "h-5 w-5",
//   "h-2.5 w-2.5",
//   "h-1.5 w-1.5",
// ];

// export function MatrixLevelCardXGold({
//   level,
//   price,
//   isUnlocked,
//   tree,
//   partnersCount,
//   recycleCount,
// }: LevelDataXGold) {
//   const navigate = useNavigate();

//   return (
//     <div
//       onClick={() => {
//         if (!isUnlocked) return;
//         navigate({
//           to: "/dashboard/$program/$level",
//           params: { program: "xgold", level: String(level) },
//         });
//       }}
//       className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all ${
//         isUnlocked
//           ? "bg-[#3865ff] text-white shadow-lg shadow-blue-600/20 cursor-pointer"
//           : "bg-[#1f2127] text-gray-400 border border-white/5"
//       }`}
//     >
//       {/* Top Header: Level + Price */}
//       <div className="flex items-center justify-between text-xs font-bold">
//         <span className={isUnlocked ? "text-blue-100" : "text-gray-400"}>Lvl {level}</span>
//         <div className="flex items-center gap-1">
//           <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
//             $
//           </span>
//           <span className={isUnlocked ? "text-white" : "text-gray-200"}>
//             {price.toLocaleString()}
//           </span>
//         </div>
//       </div>

//       {isUnlocked ? (
//         <>
//           <div className="my-4 flex flex-col items-center gap-1.5 z-10">
//             {tree.map((row, rowIdx) => (
//               <div key={rowIdx} className="flex items-center justify-center gap-1 flex-wrap">
//                 {row.map((slot, slotIdx) => (
//                   <div
//                     key={slotIdx}
//                     className={`rounded-full transition-all ${ROW_SIZES[Math.min(rowIdx, ROW_SIZES.length - 1)]} ${slotColor(
//                       slot,
//                       isUnlocked
//                     )}`}
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center gap-4 text-xs font-semibold text-blue-100 z-10">
//             <div className="flex items-center gap-1">
//               <Users className="h-3.5 w-3.5 opacity-80" />
//               <span>{partnersCount ?? 0}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <RefreshCw className="h-3.5 w-3.5 opacity-80" />
//               <span>{recycleCount ?? 0}</span>
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="pointer-events-none absolute bottom-2 right-2 opacity-10">
//           <svg className="h-16 w-16 fill-current text-white" viewBox="0 0 24 24">
//             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
//           </svg>
//         </div>
//       )}
//     </div>
//   );
// }

import { Users, RefreshCw, Wallet } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { normalizeTree } from "@/lib/utils";

export type SlotType =
  | "direct"
  | "spilloverAbove"
  | "spilloverBelow"
  | "gift"
  | "empty";

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

function slotColor(slot: SlotType, isUnlocked: boolean): string {
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
      // Empty circles visual feedback improve karne ke liye opacity + subtle ring
      return "bg-white/15 ring-1 ring-white/10";
  }
}

// Fixed dimensions per row for precise sizing and alignment
// const ROW_CONFIGS = [
//   { size: "h-7 w-7", cols: "grid-cols-2 gap-8" }, // Level 1: 2 nodes
//   { size: "h-5 w-5", cols: "grid-cols-4 gap-3" }, // Level 2: 4 nodes
//   { size: "h-3 w-3", cols: "grid-cols-8 gap-1.5" }, // Level 3: 8 nodes
//   { size: "h-2 w-2", cols: "grid-cols-16 gap-0.5" }, // Level 4: 16 nodes
// ];

export function MatrixLevelCardXGold({
  level,
  price,
  isUnlocked,
  tree,
  partnersCount,
  recycleCount,
  revenue,
  isDamage
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
          ? "bg-[#3865ff] text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:bg-[#325ce6]"
          : (isDamage? "bg-rose-400 text-white border border-white/5":"bg-[#1b1d22] text-gray-400 border border-white/5")
      }`}
    >
      {/* Header: Level + Price */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={isUnlocked ? "text-blue-100" : (isDamage?"text-white":"text-gray-400")}>
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
      {isUnlocked ? (
        <>
          {/* <div className="my-3 flex flex-col items-center justify-center gap-2 z-10 w-full">
            {tree.map((row, rowIdx) => {
              const config =
                ROW_CONFIGS[Math.min(rowIdx, ROW_CONFIGS.length - 1)];

              return (
                <div
                  key={rowIdx}
                  className={`grid ${config.cols} justify-items-center items-center w-full max-w-60`}
                >
                  {row.map((slot, slotIdx) => (
                    <div
                      key={slotIdx}
                      className={`rounded-full transition-all duration-200 ${config.size} ${slotColor(
                        slot,
                        isUnlocked,
                      )}`}
                    />
                  ))}
                </div>
              );
            })}
          </div> */}

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
                        isUnlocked,
                      )}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          {/* Bottom Footer Stats */}
          <div className="flex items-center gap-4 text-xs font-semibold text-blue-100/90 z-10 pt-1">
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
