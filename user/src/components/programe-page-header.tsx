import { formatLabel } from "@/lib/utils";

interface ProgramPageHeaderProps {
  userId?: string;
  programName?: string; // e.g. "yesfuture x3"
  activeLevelsCount?: number; // e.g. 9
  totalLevelsCount?: number; // e.g. 12
  totalProfit?: string; // e.g. "12 020 USDT"
}

export function ProgramPageHeader({
  userId = "206248",
  programName = "yesfuture x3",
  activeLevelsCount = 9,
  totalLevelsCount = 12,
  totalProfit = "12 020 USDT",
}: ProgramPageHeaderProps) {
  const program = formatLabel(programName)
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {/* Left Path & Title */}
      <div className="flex flex-col gap-1">
        <div className="text-xs font-medium text-gray-400">
          ID {userId} /{" "}
          <span className="text-gray-300">
            {program} ({activeLevelsCount} out of {totalLevelsCount} levels)
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {program}
        </h1>
      </div>

      {/* Right Profit Amount */}
      <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
        {totalProfit}
      </div>
    </div>
  );
}
