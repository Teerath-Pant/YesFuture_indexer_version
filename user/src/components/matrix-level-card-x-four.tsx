import { Users, RefreshCw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export type SlotType = "direct" | "spilloverAbove" | "spilloverBelow" | "gift" | "empty";

export interface LevelDataXFour {
  level: number;
  price: number;
  isUnlocked: boolean;
  firstLine: SlotType[]; // 2 slots
  secondLine: SlotType[]; // 4 slots
  partnersCount: number;
  recycleCount: number;
}

function slotColor(slot: SlotType, isUnlocked: boolean): string {
  if (!isUnlocked) return "bg-white/5";
  switch (slot) {
    case "direct":
      return "bg-white shadow-sm";
    case "spilloverAbove":
      return "bg-yellow-300 shadow-sm";
    case "spilloverBelow":
      return "bg-orange-400 shadow-sm";
    case "gift":
      return "bg-cyan-300 shadow-sm";
    default:
      return "bg-white/20"; // empty = faded white
  }
}

export function MatrixLevelCardXFour({
  level,
  price,
  isUnlocked,
  firstLine,
  secondLine,
  partnersCount,
  recycleCount,
}: LevelDataXFour) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        if (!isUnlocked) return;
        navigate({
          to: "/dashboard/$program/$level",
          params: { program: "x4", level: String(level) },
        });
      }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all ${
        isUnlocked
          ? "bg-[#3865ff] text-white shadow-lg shadow-blue-600/20 cursor-pointer"
          : "bg-[#1f2127] text-gray-400 border border-white/5"
      }`}
    >
      {/* Top Header: Level + Price */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={isUnlocked ? "text-blue-100" : "text-gray-400"}>Lvl {level}</span>
        <div className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
            $
          </span>
          <span className={isUnlocked ? "text-white" : "text-gray-200"}>
            {price.toLocaleString()}
          </span>
        </div>
      </div>

      {isUnlocked ? (
        <>
          {/* First line — 2 slots */}
          <div className="mt-5 flex items-center justify-center gap-3 z-10">
            {firstLine.map((slot, idx) => (
              <div
                key={idx}
                className={`sm:h-6 sm:w-6 h-8 w-8 rounded-full transition-all ${slotColor(slot, isUnlocked)}`}
              />
            ))}
          </div>

          {/* Second line — 4 slots */}
          <div className="mt-3 mb-5 flex items-center justify-center gap-2 z-10">
            {secondLine.map((slot, idx) => (
              <div
                key={idx}
                className={`sm:h-5 sm:w-5 h-6 w-6 rounded-full transition-all ${slotColor(slot, isUnlocked)}`}
              />
            ))}
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-4 text-xs font-semibold text-blue-100 z-10">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 opacity-80" />
              <span>{partnersCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 opacity-80" />
              <span>{recycleCount}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute bottom-2 right-2 opacity-10">
          <svg className="h-16 w-16 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      )}
    </div>
  );
}