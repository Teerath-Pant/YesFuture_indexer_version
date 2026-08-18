import { Users, RefreshCw, Snowflake } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export interface LevelData {
  level: number;
  price: number;
  isUnlocked: boolean;
  slots: ("direct" | "gift" | "cross" | "empty")[];
  partnersCount: number;
  recycleCount: number;
  isFreeze?: boolean;
  isDamage?: boolean;
}

export function MatrixLevelCard({
  level,
  price,
  isUnlocked,
  slots = ["empty", "empty", "empty", "empty", "empty"],
  partnersCount,
  recycleCount,
  isFreeze = false,
  isDamage = false,
}: LevelData) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        if (!isUnlocked || isFreeze || isDamage) return;
        navigate({
          to: "/dashboard/$program/$level",
          params: {
            program: "sponserMagic",
            level: String(level)
          }
        })
      }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all ${isUnlocked
        ? "bg-[#3865ff] text-white shadow-lg shadow-blue-600/20"
        : (isDamage
          ? "bg-[#1f2127] text-white border-2 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.45)]"
          : "bg-[#1f2127] text-gray-400 border border-white/5")
        }`}
    >
      {/* Top Header: Level + Price */}
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1">
          <span className={isUnlocked ? "text-blue-100" : (isDamage ? "text-rose-400" : "text-gray-400")}>Pkg {level}</span>
          {isFreeze && <Snowflake className="h-3.5 w-3.5 text-blue-200" />}
        </div>

        <div className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
            $
          </span>
          <span className={isUnlocked ? "text-white" : "text-gray-200"}>
            {price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Middle: 3 Matrix Circles */}
      <div className="my-6 flex items-center justify-between w-9/11 mx-auto gap-1 z-10">
        {slots.map((slotType, idx) => {
          let circleBg = "bg-white/20"; // empty default for unlocked

          if (isDamage) {
            // A direct child reached this locked tier — flag their slot red,
            // rest stay dim (see childAheadTiers in the caller).
            circleBg = slotType === "direct" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" : "bg-white/5";
          } else if (!isUnlocked) {
            circleBg = "bg-white/5";
          } else if (slotType === "direct") {
            circleBg = "bg-white shadow-sm";
          } else if (slotType === "gift") {
            circleBg = "bg-orange-300 shadow-sm";
          }
          else if (slotType === "cross") {
            circleBg = "bg-yellow-300 shadow-sm";
          }

          return (
            <div
              key={idx}
              className={`sm:h-7 sm:w-7 h-10 w-10 rounded-full transition-all ${circleBg}`}
            />
          );
        })}
      </div>

      {/* Bottom Stats Footer */}
      {isUnlocked || isDamage ? (
        <div className={`flex items-center gap-4 text-xs font-semibold z-10 ${isUnlocked ? "text-blue-100" : "text-gray-300"}`}>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 opacity-80" />
            <span>{partnersCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5 opacity-80" />
            <span>{recycleCount}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
