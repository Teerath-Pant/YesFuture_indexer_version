import type { PartnerRow } from "@/routes/(protected)/links/route";
import { HelpCircle, Users, ChevronDown } from "lucide-react";
import NewPartnersChart from "./new-partners-chart";

interface Profits {
  amount: string;
  currency: string;
}

interface LinksStatsProps {
  id: string | number;
  partners: number;
  team: number;
  profits: Profits;
  data: PartnerRow[];
}

export default function LinksStats({
  id,
  partners,
  team,
  profits,
  data,
}: LinksStatsProps) {
  return (
    <div className="text-white space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Links</h1>
        <span className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">
          ID {id}
        </span>
      </div>

      {/* Top row: chart card + stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Chart card */}
        {/* <div className="bg-[#212123c9] rounded-2xl p-5 min-w-[320px]">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200">
              New partners by <span className="text-white font-medium">month</span>
              <ChevronDown size={14} />
            </button>
            <div className="flex gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
                month
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
                year
              </span>
            </div>
          </div>

          <div className="relative h-40">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-600">
              {[4, 3, 2, 1, 0].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="ml-6 h-full flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <line
                  x1="0"
                  y1="38"
                  x2="100"
                  y2="38"
                  stroke="#4f46e5"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
          </div>
        </div> */}
        <NewPartnersChart data={data} />

        {/* Stat cards */}
        <div className="grid grid-cols-3 lg:flex gap-4">
          <StatCard
            label="Partners"
            value={partners}
            icon={<Users size={16} />}
            withHelp
          />
          <StatCard
            label="Team"
            value={team}
            icon={<Users size={16} />}
            withHelp
          />
        </div>
      </div>

      {/* Profits card */}
      <div className="bg-[#212123c9] rounded-2xl p-5">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          Profits
          <HelpCircle size={14} className="text-gray-500" />
        </div>
        <div className="text-2xl font-bold">
          {profits.amount.toLocaleString()} {profits.currency}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  withHelp?: boolean;
}

function StatCard({ label, value, icon, withHelp }: StatCardProps) {
  return (
    <div className="bg-[#212123c9] rounded-2xl p-5 min-w-[140px]">
      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
        <span className="flex items-center gap-1.5">
          {label}
          {withHelp && <HelpCircle size={14} className="text-gray-500" />}
        </span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
