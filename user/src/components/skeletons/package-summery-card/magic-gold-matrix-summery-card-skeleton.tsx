const ROW_SLOT_COUNTS = [2, 4, 8, 16, 32];

const ROW_SIZE = [
  "h-13 w-13 sm:h-16 sm:w-16",
  "h-11 w-11 sm:h-13 sm:w-13",
  "h-6 w-6 sm:h-10 sm:w-10",
  "sm:h-4 sm:w-4 h-3 w-3",
  "sm:h-2.5 sm:w-2.5 h-1.5 w-1.5",
];

export default function MatrixTreeCardXGoldSkeleton() {
  return (
    <div className="bg-linear-to-br from-[#406AFF] to-[#385fe9] rounded-2xl p-4 shadow-lg shadow-indigo-500/20 animate-pulse">
      {/* Header: Lvl (left) / ID (center) / coin (right) */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-5 sm:h-7 w-20 sm:w-24 rounded bg-white/20" />
        <div className="h-4 sm:h-5 w-16 rounded bg-white/20" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <div className="h-4 w-8 rounded bg-white/20" />
        </div>
      </div>

      {/* Matrix tree */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 mb-10 w-full">
        {ROW_SLOT_COUNTS.map((count, rowIdx) => {
          const sizeClass = ROW_SIZE[Math.min(rowIdx, ROW_SIZE.length - 1)];
          return (
            <div
              key={rowIdx}
              className="flex items-center justify-around w-full"
            >
              {Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full shrink-0 bg-white/15 ${sizeClass}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between flex-wrap sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-14 rounded bg-white/20" />
            <div className="h-4 w-8 rounded bg-white/20" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-14 rounded bg-white/20" />
            <div className="h-4 w-8 rounded bg-white/20" />
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="h-3 w-24 rounded bg-white/20" />
          <div className="h-4 w-16 rounded bg-white/20" />
        </div>
      </div>
    </div>
  );
}
