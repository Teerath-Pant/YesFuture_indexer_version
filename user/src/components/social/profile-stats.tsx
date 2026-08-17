import { ChevronRight, Diamond } from "lucide-react";

interface ProfitLine {
  amount: number;
  currency: string;
}

interface ProfileStatsProps {
  partners: number;
  team: number;
  ratio: number;
  profits: ProfitLine[];
  onDashboardClick?: () => void;
}

export default function ProfileStats({
  partners,
  team,
  ratio,
  profits,
  onDashboardClick,
}: ProfileStatsProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      {/* Dashboard pill button */}
      <button
        onClick={onDashboardClick}
        className="flex items-center gap-1.5 text-white text-sm font-medium px-5 py-2 rounded-full"
        style={{
          background: "linear-gradient(90deg, #e879c4, #a855f7, #6366f1)",
        }}
      >
        Dashboard
        <ChevronRight size={14} />
      </button>

      {/* Stats card */}
      <div className="bg-[#181822] rounded-2xl px-6 py-4 flex gap-8">
        <Stat label="Partners" value={partners.toLocaleString()} />
        <Stat label="Team" value={team.toLocaleString()} />
        <Stat label="Ratio" value={`${ratio}%`} />
        <div>
          <div className="text-gray-500 text-xs font-medium mb-2">Total profits</div>
          <div className="space-y-1">
            {profits.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white text-sm font-medium">
                {p.amount.toLocaleString(undefined, { minimumFractionDigits: p.amount % 1 === 0 ? 0 : 1 })}
                <Diamond size={12} className="text-amber-400" fill="currentColor" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500 text-xs font-medium mb-2">{label}</div>
      <div className="text-white text-lg font-bold">{value}</div>
    </div>
  );
}
