import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface PartnerLike {
  date: string; // format: "YYYY.MM.DD HH:mm"
}

type GroupBy = "week" | "month" | "year";

interface NewPartnersChartProps {
  data: PartnerLike[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseDate(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(" ");
  const [y, m, d] = datePart.split(".").map(Number);
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
    2,
    "0",
  )}T${timePart ?? "00:00"}:00`;
  return new Date(iso);
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon ...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

interface Bucket {
  key: number;
  label: string;
  count: number;
}

function buildBuckets(data: PartnerLike[], groupBy: GroupBy): Bucket[] {
  const now = new Date();

  if (groupBy === "month") {
    const year = now.getFullYear();
    const buckets: Bucket[] = MONTH_LABELS.map((label, idx) => ({
      key: idx,
      label,
      count: 0,
    }));
    data.forEach((row) => {
      const d = parseDate(row.date);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()].count += 1;
      }
    });
    return buckets;
  }

  if (groupBy === "year") {
    const currentYear = now.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    const buckets: Bucket[] = years.map((y) => ({
      key: y,
      label: String(y),
      count: 0,
    }));
    data.forEach((row) => {
      const d = parseDate(row.date);
      const bucket = buckets.find((b) => b.key === d.getFullYear());
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }

  // groupBy === "week" — current week ke 7 din (Mon–Sun)
  const monday = getMonday(now);
  const buckets: Bucket[] = DAY_LABELS.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return { key: d.getTime(), label, count: 0 };
  });

  data.forEach((row) => {
    const d = parseDate(row.date);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const bucket = buckets.find((b) => b.key === dayStart.getTime());
    if (bucket) bucket.count += 1;
  });

  return buckets;
}

/** Nice round max for the Y axis (e.g. 7 -> 8, 23 -> 25) */
function getAxisMax(maxCount: number): number {
  if (maxCount <= 4) return 4;
  if (maxCount <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxCount)));
  return Math.ceil(maxCount / magnitude) * magnitude;
}

export default function NewPartnersChart({ data }: NewPartnersChartProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);

  const buckets = useMemo(() => buildBuckets(data, groupBy), [data, groupBy]);
  const rawMax = Math.max(1, ...buckets.map((b) => b.count));
  const axisMax = getAxisMax(rawMax);
  const now = new Date();

  const ySteps = 4; // number of divisions (0, 1/4, 2/4, 3/4, max)
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((axisMax / ySteps) * (ySteps - i)),
  );

  return (
    <div className="bg-[#212123c9] rounded-2xl p-5 min-w-[320px]">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
          >
            New partners by{" "}
            <span className="text-white font-medium capitalize">{groupBy}</span>
            <ChevronDown size={14} />
          </button>

          {isMenuOpen && (
            <div className="absolute left-0 mt-2 bg-[#2a2a2e] rounded-xl shadow-lg overflow-hidden z-10">
              {(["week", "month", "year"] as GroupBy[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setGroupBy(option);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-white/5 ${
                    option === groupBy ? "text-indigo-400" : "text-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {groupBy === "month" && (
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
              {now.getFullYear()}
            </span>
          )}
          {groupBy === "year" && (
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
              Last 5 years
            </span>
          )}
          {groupBy === "week" && (
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
              {(() => {
                const monday = getMonday(now);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                return `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
              })()}
            </span>
          )}
        </div>
      </div>

      {/* Chart area: Y-axis labels + grid + bars */}
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-48 text-xs text-gray-500 pb-6 pt-2">
          {yLabels.map((val, idx) => (
            <span key={idx}>{val}</span>
          ))}
        </div>

        {/* Bars + gridlines */}
        <div className="relative flex-1 h-48">
          {/* Horizontal gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-6 pt-2">
            {yLabels.map((_, idx) => (
              <div key={idx} className="w-full border-t border-white/5" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end gap-2 pt-2 pb-6">
            {buckets.map((bucket) => {
              const heightPct = (bucket.count / axisMax) * 100;
              const isHovered = hoveredKey === bucket.key;
              return (
                <div
                  key={bucket.key}
                  className="relative flex-1 h-full flex items-end justify-center"
                  onMouseEnter={() => setHoveredKey(bucket.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-2 -translate-y-full bg-[#0e0e15] border border-white/10 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-10">
                      {bucket.count} {bucket.count === 1 ? "partner" : "partners"}
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t-md transition-all cursor-pointer ${
                      isHovered
                        ? "bg-linear-to-t from-indigo-500 to-indigo-300"
                        : "bg-linear-to-t from-indigo-600 to-indigo-400"
                    }`}
                    style={{
                      height: `${bucket.count > 0 ? Math.max(heightPct, 3) : 0}%`,
                    }}
                  />

                  {/* X axis label */}
                  <span className="absolute -bottom-6 text-[10px] text-gray-500 whitespace-nowrap">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}