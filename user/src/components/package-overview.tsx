import { useNavigate } from "@tanstack/react-router";
import { Shield, Gem, Users } from "lucide-react";

interface PackageCardData {
  key: string;
  name: string;
  eyebrow: string;
  icon: React.ElementType;
  purchased: number;
  total: number;
  redirect: string;
}

interface PackageOverviewProps {
  isPreviewMode?: boolean;
  magicLevelPurchased?: number;
  magicGoldMatrixPurchased?: number;
  sponsorMagicPurchased?: number;
}

const TOTAL_PER_CARD = 9; // 3 cards x 3 packages = 9 total

export default function PackageOverview({
  isPreviewMode = true,
  magicLevelPurchased = 0,
  magicGoldMatrixPurchased = 0,
  sponsorMagicPurchased = 0,
}: PackageOverviewProps) {

  const packages: PackageCardData[] = [
    {
      key: "magic-level",
      name: "Magic Level",
      eyebrow: "MAGIC PACKAGES",
      icon: Shield,
      purchased: magicLevelPurchased,
      total: TOTAL_PER_CARD,
      redirect: "/package-purchase",
    },
    {
      key: "magic-gold-matrix",
      name: "Magic Gold Matrix",
      eyebrow: "MAGIC PACKAGES",
      icon: Gem,
      purchased: magicGoldMatrixPurchased,
      total: TOTAL_PER_CARD,
      redirect: "/package-purchase",
    },
    {
      key: "sponsor-magic",
      name: "Sponsor Magic",
      eyebrow: "MAGIC PACKAGES",
      icon: Users,
      purchased: sponsorMagicPurchased,
      total: TOTAL_PER_CARD,
      redirect: "/package-purchase",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {packages.map(({ key, name, eyebrow, purchased, total,redirect }) => {
        const percent = Math.min(100, Math.round((purchased / total) * 100));
        const soldOut = purchased >= total;
        const navigate = useNavigate();

        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl bg-[#212123] border border-white/5 p-6 flex flex-col gap-5"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              {/* <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#141416] border border-[#3db188]/30">
                <Icon className="h-6 w-6 text-[#3db188]" strokeWidth={1.75} />
              </div> */}
              <div className="min-w-0">
                <span className="block text-[10px] font-bold tracking-wider text-gray-500">
                  {eyebrow}
                </span>
                <span className="block text-lg font-bold text-white truncate">
                  {name}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3db188] transition-all duration-500 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  {purchased} / {total} purchased
                </span>
                <span>{percent}%</span>
              </div>
            </div>

            {/* Buy Now button */}
            {!isPreviewMode && <button
              type="button"
              onClick={() => {
                navigate({ to: `${redirect}` })
              }}
              disabled={soldOut}
              className={[
                "self-start rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200",
                soldOut
                  ? "bg-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-white text-[#101112] hover:bg-gray-100",
              ].join(" ")}
            >
              {soldOut ? "Completed" : "Buy Now"}
            </button>}
          </div>
        );
      })}
    </div>
  );
}
