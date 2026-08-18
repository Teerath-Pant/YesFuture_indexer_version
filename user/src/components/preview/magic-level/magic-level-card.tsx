import { Users, Snowflake, Wallet } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export interface LevelData {
  level: number;
  price: number;
  isUnlocked: boolean;
  totalAmount: number;
  isFreeze?: boolean;
  isDamage?: boolean;
}

export function PreviewUserMagicLevelCard({
  level,
  price,
  isUnlocked,
  totalAmount,
  isFreeze = false,
  isDamage = false,
}: LevelData) {
  const navigate = useNavigate();
  const { id } = useSearch({ from: "/preview" });

  return (
    <div
      onClick={() => {
        if (!isUnlocked || isFreeze || isDamage) return;
        navigate({
          to: "/preview/dashboard/$program/$level",
          params: {
            program: "magicLevels",
            level: String(level),
          },
          search: {
            id: id,
          },
        });
      }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all cursor-pointer ${
        isUnlocked
          ? "bg-[#3865ff] text-white shadow-lg shadow-blue-600/20"
          : isDamage
          ? "bg-[#1b1d22] text-white shadow-lg shadow-blue-600/20"
          : "bg-[#1f2127] text-gray-400 border border-white/5"
      }`}
    >
      {/* Top Header: Level + Price */}
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1">
          <span className={isUnlocked ? "text-blue-100" : isDamage ? "text-white" : "text-gray-400"}>
            Pkg {level}
          </span>
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

      {/* Middle: Partners + Total Amount */}
      <div className="my-6 flex items-center justify-around z-10">
        {/* <div className="flex flex-col items-center gap-1">
          <Users className="h-5 w-5 opacity-90" />
          <span className="text-lg font-bold">{partnersCount}</span>
          <span className={`text-[10px] ${isUnlocked ? "text-blue-100" : "text-gray-400"}`}>
            Partners
          </span>
        </div>

        <div className="h-8 w-px bg-white/20" /> */}

        <div className="flex flex-col items-center gap-1">
          <Wallet className="h-5 w-5 opacity-90" />
          <span className="text-lg font-bold">{totalAmount.toLocaleString()}</span>
          <span className={`text-[10px] ${isUnlocked ? "text-blue-100" : "text-gray-400"}`}>
            Total USDT
          </span>
        </div>
      </div>

    </div>
  );
}