import { ChevronRight, Trophy, Lock } from "lucide-react";

export interface RankBadge {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string; // e.g. "#6366f1" — badge ke ring/glow ka color
  locked?: boolean;
}

interface RankBadgesProps {
  badges: RankBadge[];
  onShowAll?: () => void;
}

export default function RankBadges({ badges, onShowAll }: RankBadgesProps) {
  return (
    <div className="bg-[#181822] rounded-2xl px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: badge.locked
                  ? "#232330"
                  : `radial-gradient(circle, ${badge.color ?? "#6366f1"}33, transparent 70%)`,
                border: `2px solid ${badge.locked ? "#33333f" : badge.color ?? "#6366f1"}`,
              }}
            >
              {badge.locked ? (
                <Lock size={22} className="text-gray-600" />
              ) : (
                badge.icon ?? <Trophy size={26} style={{ color: badge.color ?? "#6366f1" }} />
              )}
            </div>
            {!badge.locked && (
              <span className="text-gray-400 text-xs font-medium">{badge.label}</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onShowAll}
        className="flex items-center gap-2 text-gray-300 text-sm font-medium hover:text-white"
      >
        Show all
        <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
          <ChevronRight size={14} className="text-white" />
        </span>
      </button>
    </div>
  );
}
