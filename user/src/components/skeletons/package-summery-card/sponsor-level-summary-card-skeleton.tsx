export function SponsorLevelSummaryCardSkeleton() {
  return (
    <div className="bg-linear-to-br from-[#406AFF] to-[#385fe9] rounded-2xl p-2 sm:p-6 shadow-lg shadow-indigo-500/20 animate-pulse">
      {/* Top row */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-6 sm:h-8 w-24 sm:w-32 rounded bg-white/20" />
        <div className="h-5 w-16 rounded bg-white/20" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <div className="h-4 w-8 rounded bg-white/20" />
        </div>
      </div>

      {/* Partner avatar slots */}
      <div className="flex justify-between sm:w-9/11 mx-auto mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="sm:w-16 sm:h-16 h-12 w-12 rounded-full bg-white/15"
          />
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
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
          <div className="h-3 w-28 rounded bg-white/20" />
          <div className="h-4 w-16 rounded bg-white/20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full page-level skeleton for XThreeLevelPage:
 * breadcrumb/header area + summary card + transaction table.
 * Use this instead of the current `if (loading) { spinner }` block.
 */
export function XThreeLevelPageSkeleton() {
  return (
    <div className="w-full text-white animate-pulse">
      {/* LevelPageLayout header area (breadcrumb, title, upline, cycle nav) */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-3 w-3 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="h-3 w-3 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/10" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="h-8 w-8 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Summary card */}
      <SponsorLevelSummaryCardSkeleton />

      {/* Transaction table */}
      <div className="my-8 space-y-2">
        <div className="grid grid-cols-4 gap-4 px-2 py-3">
          <div className="h-3 w-12 rounded bg-white/10" />
          <div className="h-3 w-8 rounded bg-white/10" />
          <div className="h-3 w-14 rounded bg-white/10" />
          <div className="h-3 w-10 rounded bg-white/10 justify-self-end" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 items-center px-2 py-3 rounded-lg bg-white/5"
          >
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-5 w-14 rounded-full bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-4 w-12 rounded bg-white/10 justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SponsorLevelSummaryCardSkeleton;
