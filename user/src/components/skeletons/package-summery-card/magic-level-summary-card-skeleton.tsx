export default function MagicLevelSummaryCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 bg-[#3865ff] text-white shadow-lg shadow-blue-600/20 animate-pulse">
      {/* Top Header: Level + ID + Price */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-4 w-16 rounded bg-white/20" />
        <div className="h-4 w-16 rounded bg-white/20" />
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-white/20" />
          <div className="h-4 w-10 rounded bg-white/20" />
        </div>
      </div>

      {/* Middle: Partners + Total Amount */}
      <div className="my-4 flex items-center justify-around z-10">
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-6 rounded bg-white/20" />
          <div className="h-6 w-8 rounded bg-white/20" />
          <div className="h-3 w-14 rounded bg-white/20" />
        </div>

        <div className="h-10 w-px bg-white/20" />

        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-6 rounded bg-white/20" />
          <div className="h-6 w-16 rounded bg-white/20" />
          <div className="h-3 w-20 rounded bg-white/20" />
        </div>
      </div>
    </div>
  );
}
