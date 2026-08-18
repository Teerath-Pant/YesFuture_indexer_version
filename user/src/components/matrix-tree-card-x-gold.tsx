import { Users, RefreshCw, Wallet } from "lucide-react";
import { type SlotType } from "./matrix-level-card-x-gold";
import { useNavigate, useParams } from "@tanstack/react-router";

export interface TreeNode {
  id?: string;
  slot: SlotType;
}

export interface MatrixTreeCardXGoldProps {
  level: number;
  ownerId: string; 
  coinCount: number; 
  tree: TreeNode[][]; 
  partnersCount: number;
  cyclesCount: number;
  totalRevenue: string; 
}

function circleClasses(slot: SlotType): string {
  switch (slot) {
    case "direct":
      return "bg-white text-neutral-900";
    case "spilloverAbove":
      return "bg-yellow-300 text-yellow-900";
    case "spilloverBelow":
      return "bg-orange-400 text-orange-950";
    case "gift":
      return "bg-cyan-300 text-cyan-950";
    case "empty":
    default:
      return "bg-white/25 text-transparent";
  }
}

const ROW_SLOT_COUNTS = [2, 4, 8, 16, 32];

function normalizeTree(tree: TreeNode[][]): TreeNode[][] {
  return ROW_SLOT_COUNTS.map((expectedCount, rowIdx) => {
    const row = tree[rowIdx] ?? [];
    const padded = [...row];

    while (padded.length < expectedCount) {
      padded.push({ slot: "empty" });
    }

    return padded.slice(0, expectedCount);
  });
}

const ROW_SIZE = [
  "h-13 w-13 sm:h-16 sm:w-16 text-sm font-semibold",
  "h-11 w-11 sm:h-13 sm:w-13 text-xs font-semibold",
  "h-6 w-6 sm:h-10 sm:w-10 text-[10px] font-medium",
  "sm:h-4 sm:w-4 h-3 w-3",
  "sm:h-2.5 sm:w-2.5 h-1.5 w-1.5",
];

function idVisibilityClass(rowIdx: number): string {
  if (rowIdx <= 1) return "";
  if (rowIdx === 2) return "hidden sm:flex";
  return "hidden";
}

export default function MatrixTreeCardXGold({
  level,
  ownerId,
  coinCount,
  tree,
  partnersCount,
  cyclesCount,
  totalRevenue,
}: MatrixTreeCardXGoldProps) {
  const normalizedTree = normalizeTree(tree);
  const navigate = useNavigate();
  const { program, level: lvl } = useParams({ strict: false });
  return (
    <div className="bg-linear-to-br from-[#406AFF] to-[#385fe9] rounded-2xl p-4 shadow-lg shadow-indigo-500/20">
      {/* Header: Lvl (left) / ID (center) / coin (right) */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-indigo-100/70 text-lg sm:text-2xl font-semibold">
          Package {level}
        </span>
        <span className="text-white text-base sm:text-lg font-bold">
          {ownerId}
        </span>
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] text-black">
            $
          </span>
          {coinCount}
        </span>
      </div>

      {/* Matrix tree */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 mb-10 w-full">
        {normalizedTree.map((row, rowIdx) => {
          const sizeClass = ROW_SIZE[Math.min(rowIdx, ROW_SIZE.length - 1)];
          // const showId = rowIdx <= 2; // last row bahut chhoti hai, sirf dot dikhega
          const idClass = idVisibilityClass(rowIdx);
          return (
            <div
              key={rowIdx}
              className="flex items-center justify-around w-full"
            >
              {row.map((node, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (!node.id) return; 
                    if (!program || !lvl) return;
                    navigate({
                      to: "/preview/dashboard/$program/$level",
                      params: {
                        program: program,
                        level: lvl,
                      },
                      search: {
                        id: node.id,
                      },
                    });
                  }}
                  className={`rounded-full flex items-center justify-center shrink-0 transition-all ${sizeClass} ${circleClasses(
                    node.slot,
                  )} ${node.id ? "cursor-pointer hover:opacity-80" : ""}`}
                >
                  {node.id && <span className={idClass}>{node.id}</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between flex-wrap sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-indigo-100/70 text-sm">Partners</span>
            <span className="flex items-center gap-1.5 text-white text-sm font-medium">
              <Users size={14} /> {partnersCount}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-indigo-100/70 text-sm">Cycles</span>
            <span className="flex items-center gap-1.5 text-white text-sm font-medium">
              {/* cyclesCount counts placements (1 = no recycle yet) — cycles are
                  displayed 0-indexed project-wide, so show completed recycles. */}
              <RefreshCw size={14} /> {Math.max(cyclesCount - 1, 0)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <span className="text-indigo-100/70 text-sm">
            Total level revenue
          </span>
          <span className="flex items-center gap-1.5 text-white text-sm font-medium">
            <Wallet size={14} /> {totalRevenue}
          </span>
        </div>
      </div>
    </div>
  );
}
