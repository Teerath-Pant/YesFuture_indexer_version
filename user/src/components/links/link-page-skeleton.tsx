interface LinkPageSkeletonProps {
  linkCount?: number;
}

export default function LinkPageSkeleton({ linkCount = 3 }: LinkPageSkeletonProps) {
  return (
    <div className="text-white space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-24 bg-white/10 rounded-lg" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>

      {/* Top row: chart card + stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Chart card skeleton */}
        <div className="bg-[#212123c9] rounded-2xl p-5 min-w-[320px]">
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-32 bg-white/10 rounded-md" />
            <div className="flex gap-2">
              <div className="h-6 w-14 bg-white/10 rounded-full" />
              <div className="h-6 w-14 bg-white/10 rounded-full" />
            </div>
          </div>

          <div className="flex gap-3">
            {/* Y axis skeleton */}
            <div className="flex flex-col justify-between h-48 pb-6 pt-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <div key={n} className="h-3 w-4 bg-white/10 rounded" />
              ))}
            </div>

            {/* Bars skeleton */}
            <div className="flex-1 h-48 flex items-end gap-2 pb-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/10 rounded-t-md"
                  style={{ height: `${20 + ((i * 13) % 60)}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-3 lg:flex gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>

      {/* Profits card skeleton */}
      <div className="bg-[#212123c9] rounded-2xl p-5">
        <div className="h-4 w-16 bg-white/10 rounded-md mb-3" />
        <div className="h-7 w-32 bg-white/10 rounded-md" />
      </div>

      {/* Link cards skeleton */}
      <div className="space-y-4 mt-8">
        {Array.from({ length: linkCount }).map((_, i) => (
          <LinkCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#212123c9] rounded-2xl p-5 min-w-[140px]">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 bg-white/10 rounded-md" />
        <div className="h-4 w-4 bg-white/10 rounded-full" />
      </div>
      <div className="h-7 w-10 bg-white/10 rounded-md" />
    </div>
  );
}

function LinkCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 flex items-center justify-between bg-white/5">
      <div className="flex-1">
        <div className="h-4 w-32 bg-white/10 rounded-md mb-2" />
        <div className="h-6 w-48 bg-white/10 rounded-md" />
      </div>
      <div className="h-10 w-24 bg-white/10 rounded-xl" />
    </div>
  );
}