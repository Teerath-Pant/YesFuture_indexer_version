interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  hasIcon?: boolean;
}

export default function TableSkeleton({
  columns = 3,
  rows = 5,
  hasIcon = false,
}: TableSkeletonProps) {
  return (
    <div className="bg-[#212123c9] rounded-2xl overflow-hidden flex flex-col max-h-150">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3A3B3C]">
              {hasIcon && (
                <th className="px-4 py-4">
                  <div className="h-3 w-10 rounded bg-neutral-700/50 animate-pulse" />
                </th>
              )}
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-4">
                  <div className="h-3 w-16 rounded bg-neutral-700/50 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#3A3B3C] last:border-0"
              >
                {hasIcon && (
                  <td className="px-4 py-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-700/50 animate-pulse" />
                  </td>
                )}
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-4">
                    <div className="h-4 w-20 rounded bg-neutral-700/40 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full flex items-center justify-between px-4 py-3 border-t border-neutral-800">
        <div className="h-3 w-24 rounded bg-neutral-700/40 animate-pulse" />
        <div className="h-3 w-16 rounded bg-neutral-700/40 animate-pulse" />
      </div>
    </div>
  );
}