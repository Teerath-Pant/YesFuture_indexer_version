// import React from "react";
import { Users, RefreshCw, HelpCircle } from "lucide-react";
import { MatrixLevelCard,type LevelData } from "@/components/matrix-level-card";

interface MatrixGridProps {
  levels: LevelData[];
}

export function MatrixGridXThree({ levels }: MatrixGridProps) {
  return (
    <div className="rounded-3xl border border-white/5 p-4 shadow-2xl sm:p-6 bg-[radial-gradient(ellipse_80%_150%_at_80%_100%,#3b82f6_0%,#1d1e1f_55%)]">
      {/* 5 Column Responsive Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
        {levels.map((lvl) => (
          <MatrixLevelCard key={lvl.level} {...lvl} />
        ))}
      </div>

      {/* Bottom Marketing Legend Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-gray-400">
        <div className="flex flex-wrap items-center gap-6">
          {/* Direct Partner */}
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-white" />
            <span className="font-medium text-gray-300">Direct partner</span>
          </div>

          {/* Gift */}
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-cyan-300" />
            <span className="font-medium text-gray-300">Gift</span>
          </div>

          {/* Partners on level */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-300">Partners on level</span>
          </div>

          {/* Level Cycle */}
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-300">Level Cycle</span>
          </div>
        </div>

        {/* Marketing Legend Button */}
        <button className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Marketing legend</span>
        </button>
      </div>
    </div>
  );
}
