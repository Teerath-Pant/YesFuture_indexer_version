// import React from "react";
import { Users, RefreshCw, ArrowUp, HelpCircle } from "lucide-react";
import { MatrixLevelCardXGold,type LevelDataXGold } from "@/components/matrix-level-card-x-gold";

interface MatrixGridProps {
  levels: LevelDataXGold[];
}

export function MatrixGridXGold({ levels }: MatrixGridProps) {
  return (
    <div className="rounded-3xl border border-white/5 p-4 shadow-2xl sm:p-6 bg-[radial-gradient(ellipse_80%_150%_at_80%_100%,#f59e0b_0%,#1d1e1f_55%)]">
      {/* Responsive grid: 1 col mobile -> 2 -> 3 -> 5 on wide desktop */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((lvl) => (
          <MatrixLevelCardXGold key={lvl.level} {...lvl} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-col gap-3 pt-6 text-xs text-gray-400">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-white" />
            <span className="font-medium text-gray-300">Direct partner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-yellow-300" />
            <span className="font-medium text-gray-300">Spillover from above</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-rose-400" />
            <span className="font-medium text-gray-300">Package Damage</span>
          </div> */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-300">Partners on Package</span>
          </div>
          <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-300">Level Cycle</span>
            </div>
        </div>

        {/* <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-300">Level Cycle</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-300">Send to upline</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Marketing legend</span>
          </button>
        </div> */}
      </div>
    </div>
  );
}
