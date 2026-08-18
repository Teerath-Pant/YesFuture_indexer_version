import type { ProgramTypes } from "@/constants/programs";
import { formatAmount } from "@/lib/helper";
import { useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";

export interface ProgramCardProps {
  titleText?: ProgramTypes;
  totalProfit?: string | number;
  description?: string;
  totalLevels?: number;
  activeLevels?: number;
  previewLabel?: string;
  accentColor?: string;
  onClickPreview?: () => void;
}

export function ProgramCard({
  titleText = "sponserMagic",
  totalProfit = "0",
  description = "Click on any of the programs to see the detailed view or press Approve to enable USDT transactions.",
  totalLevels = 9,
  activeLevels = 0,
  previewLabel = "x3 Preview",
  accentColor = "#c9a227", // muted gold-yellow, image jaisa
  onClickPreview,
}: ProgramCardProps) {
  const isInactive = activeLevels === 0;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate({
          to: "/dashboard/$program",
          params: {
            program: titleText,
          },
        });
      }}
      className="card-gradient relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-[#1c1d21] p-3 shadow-2xl"
      style={{ "--accent": accentColor } as CSSProperties}
    >
      {/* 2. INNER TOP BANNER BOX — near-black, full width */}
      <div className="relative inset-0 z-10 flex h-20 w-full flex-col justify-between overflow-hidden rounded-2xl bg-[#0a0a0a]/60 p-5">
        {/* <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-medium text-gray-400">Total profit</span>
          <span className="text-xl font-extrabold tracking-wide text-white">{totalProfit}</span>
        </div> */}

        {/* Watermark - bahut subtle */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-3xl sm:text-6xl xl:text-4xl font-black text-nowrap tracking-tighter opacity-[0.38]"
          style={{ color: accentColor }}
        >
          {titleText}
        </span>
      </div>
      <div className="flex flex-col self-end pt-3">
        {/* <span className="text-xs font-medium text-gray-400">Total Profit</span> */}
        <span className="text-xl px-4 font-extrabold tracking-wide text-white">
          ${formatAmount(totalProfit)}
        </span>
      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="relative z-10 mt-8 mb-2 flex items-end justify-between gap-4">
        {isInactive ? (
          <p className="px-2 text-xs leading-relaxed text-gray-400">
            {description}
          </p>
        ) : (
          <div className="flex w-full py-5 flex-col sm:flex-row gap-5 sm:justify-between sm:items-end">
            <div className="grid grid-cols-5 gap-2 w-full sm:max-w-55">
              {Array.from({ length: totalLevels }).map((_, index) => {
                const isActive = index < activeLevels;
                return (
                  <div
                    key={index}
                    className={`h-9 rounded-md transition-all ${
                      isActive
                        ? "bg-[#3b82f6] shadow-sm shadow-blue-500/40"
                        : "bg-[#292b31]"
                    }`}
                  />
                );
              })}
            </div>

            {previewLabel && (
              <button
                onClick={onClickPreview}
                className="flex py-3 sm:max-w-50 flex-1 items-center justify-center rounded-md bg-[#464850]/20 border border-white/10 hover:border-white/40 px-4 text-sm font-semibold text-gray-300 transition-colors hover:bg-[#2c2f38] hover:text-white"
              >
                <span>Preview</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
