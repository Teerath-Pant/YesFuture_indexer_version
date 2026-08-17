import { Users, Wallet } from "lucide-react";

export interface LevelSummaryCardProps {
  level: number;
  id: string; // e.g. "206248"
  coinCount: number; // price
  partnersCount: number;
  totalRevenue: string; // e.g. "710 USDT"
}

export default function PreviewMagicLevelSummaryCard({
  level,
  id,
  coinCount,
  partnersCount,
  totalRevenue,
}: LevelSummaryCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 bg-[#3865ff] text-white shadow-lg shadow-blue-600/20">
      {/* Top Header: Level + ID + Price */}
      <div className="flex items-center justify-between text-sm font-bold mb-8">
        <span className="text-blue-100">Level {level}</span>
        <span className="text-white text-base">ID {id}</span>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
            $
          </span>
          <span className="text-white">{coinCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Middle: Partners + Total Amount */}
      <div className="my-4 flex items-center justify-around z-10">
        <div className="flex flex-col items-center gap-1">
          <Users className="h-6 w-6 opacity-90" />
          <span className="text-xl font-bold">{partnersCount}</span>
          <span className="text-xs text-blue-100">Partners</span>
        </div>

        <div className="h-10 w-px bg-white/20" />

        <div className="flex flex-col items-center gap-1">
          <Wallet className="h-6 w-6 opacity-90" />
          <span className="text-xl font-bold">{totalRevenue}</span>
          <span className="text-xs text-blue-100">Total Revenue</span>
        </div>
      </div>
    </div>
  );
}