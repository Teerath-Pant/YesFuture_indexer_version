import { type ReactNode, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowIcon?: (row: T) => ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
  pageSize?: number; // naya prop, default 10
  onSeeMore?: () => void; // optional "See more" footer button
}

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export default function DataTable<T>({
  columns = [],
  data = [],
  getRowIcon,
  getRowKey,
  pageSize = 10,
  onSeeMore,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Agar data change ho aur current page invalid ho jaye, to clamp kar do
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-[#212123c9] rounded-2xl overflow-hidden flex flex-col max-h-150">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3A3B3C]">
              {getRowIcon && (
                <th className="text-sm text-gray-400 font-normal px-4 py-4 whitespace-nowrap">
                  Type
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    "text-sm text-gray-400 font-normal px-4 py-4 whitespace-nowrap " +
                    alignClass(col.align)
                  }
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr
                key={getRowKey ? getRowKey(row, i) : i}
                className="border-b border-[#3A3B3C] last:border-0 hover:bg-neutral-800/30 transition-colors"
              >
                {getRowIcon && (
                  <td className="px-4 py-4">
                    <div className="relative w-10 h-10 rounded-full bg-[#3A3B3C] flex items-center justify-center">
                      {getRowIcon(row)}
                    </div>
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={
                      "px-4 py-4 text-sm whitespace-nowrap text-neutral-200 " +
                      alignClass(col.align)
                    }
                  >
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}

            {totalItems === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (getRowIcon ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {onSeeMore ? (
        <button
          onClick={onSeeMore}
          className="w-full py-4 text-gray-400 hover:text-white hover:bg-neutral-800/40 transition-colors border-t border-neutral-800 text-sm"
        >
          See more
        </button>
      ) : totalItems > 0 && (
        <div className="w-full flex items-center justify-between px-4 py-3 border-t border-neutral-800 text-sm text-gray-400">
          <span>
            {startIndex} to {endIndex} from {totalItems}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={safePage === 1}
              className="p-1 rounded hover:bg-neutral-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-white text-xs font-medium">
              {safePage}/{totalPages}
            </span>

            <button
              onClick={goNext}
              disabled={safePage === totalPages}
              className="p-1 rounded hover:bg-neutral-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}