import { Activity, Clock, CircleDot, UserCheck, Layers, ShoppingBag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGlobalIncomeActivity, fetchPlatformStats, fetchPlatform24hStats } from "@/lib/auth-api";
import type { GlobalIncomeItem } from "@/lib/auth-api";
import { formatAmount, formatTimeAgo } from "@/lib/helper";

const defaultPlatformStats = [
  { label: "Members total", value: "0", change: "+0" },
  { label: "Turnover, USDT", value: "0 USDT", change: "+0" },
];

type ActivityFilterType = "ALL" | "SPONSOR" | "LEVEL" | "MATRIX" | "PACKAGE_PURCHASE" | "AUTO_UPGRADE";
function isPendingIncome(item: GlobalIncomeItem) {
  return item.rawDate == null || item.rawDate <= 0 || item.time?.toLowerCase() === "pending";
}

function getItemConfig(item: GlobalIncomeItem) {
  const isPurchase = item.incomeType === "PACKAGE_PURCHASE" || item.incomeType === "AUTO_UPGRADE";
  const amountPrefix = isPurchase ? "-" : "+";
  const amountColor = isPurchase ? "text-rose-400" : "text-emerald-400";
  const cleanAmount = item.amount.replace(/^[+-]/, "");
  const amountFormatted = `${amountPrefix}${cleanAmount}`;

  switch (item.incomeType) {
    case "SPONSOR":
      return {
        icon: <UserCheck className="h-5 w-5" />,
        bgColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        title: `${item.receiverId}`,
        subtitle: item.fromId ? `from ${item.fromId}` : "Sponsor reward",
        categoryLabel: "Sponsor Income",
        amountColor,
        amountFormatted
      };
    case "LEVEL":
      return {
        icon: <Layers className="h-5 w-5" />,
        bgColor: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        badgeBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
        title: `${item.receiverId}`,
        subtitle: item.fromId ? `from ${item.fromId}` : `Level ${item.level || 1} bonus`,
        categoryLabel: `Level ${item.level || 1} Income`,
        amountColor,
        amountFormatted
      };
    case "MATRIX":
      return {
        icon: <CircleDot className="h-5 w-5" />,
        bgColor: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        badgeBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
        title: `${item.receiverId}`,
        subtitle: item.fromId ? `from ${item.fromId}` : "Matrix structure distribution",
        categoryLabel: "Matrix Income",
        amountColor,
        amountFormatted
      };
    case "PACKAGE_PURCHASE": {
      const trackName = item.track && item.track !== "System Pool" ? item.track.toUpperCase() : "";
      const pkgLabel = item.packageId ? `Package ${item.packageId}` : "Package";
      return {
        icon: <ShoppingBag className="h-5 w-5" />,
        bgColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        badgeBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
        title: `${item.receiverId}  Purchased ${trackName ? `${trackName} ${pkgLabel}` : pkgLabel}`,
        subtitle: trackName ? `Manual Purchase (${trackName} Track)` : "Manual Package Purchase",
       
        amountColor,
        amountFormatted
      };
    }
    case "AUTO_UPGRADE": {
      const trackName = item.track && item.track !== "System Pool" ? item.track.toUpperCase() : "";
      const pkgLabel = item.packageId ? `Package ${item.packageId}` : "Package";
      return {
        icon: <Zap className="h-5 w-5" />,
        bgColor: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        badgeBg: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
        title: `${item.receiverId}  Auto Upgrade to ${trackName ? `${trackName} ${pkgLabel}` : pkgLabel}`,
        subtitle: trackName ? `Auto Upgrade (${trackName} Track)` : "System Auto Package Upgrade",
        categoryLabel: "Auto Upgrade",
        amountColor,
        amountFormatted
      };
    }
    default:
      return {
        icon: <Activity className="h-5 w-5" />,
        bgColor: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
        badgeBg: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
        title: `${item.receiverId}  Activity +${cleanAmount}`,
        subtitle: item.fromId ? `from ${item.fromId}` : "System Activity",
        categoryLabel: "Income",
        amountColor,
        amountFormatted
      };
  }
}

export function RecentActivety() {
  const [recentActivity, setRecentActivity] = useState<GlobalIncomeItem[]>([]);
  const [platformStats, setPlatformStats] = useState(defaultPlatformStats);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, _setActiveFilter] = useState<ActivityFilterType>("ALL");

  useEffect(() => {
    let active = true;

    Promise.all([fetchPlatformStats(), fetchPlatform24hStats()])
      .then(([stats, stats24h]) => {
        if (!active) return;
        setPlatformStats((current) =>
          current.map((item) => {
            if (item.label === "Members total") return { ...item, value: stats.totalMembers, change: `+${stats24h.membersChange}` };
            if (item.label === "Turnover, USDT") return { ...item, value: `${formatAmount(stats.totalUsdtInvested)} USDT`, change: `+${formatAmount(stats24h.turnoverChange)} USDT` };
            return item;
          })
        );
      })
      .catch((error) => console.error("Error loading platform stats:", error));

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchGlobalIncomeActivity(25)
      .then((items) => {
        if (active) {
          const listToUse = items || [];
          const sortedItems = [...listToUse].sort((a, b) => {
            const aPending = isPendingIncome(a);
            const bPending = isPendingIncome(b);
            if (aPending && !bPending) return 1;
            if (!aPending && bPending) return -1;

            const timeDiff = Math.abs(b.rawDate - a.rawDate);
            const isAPurchase = a.incomeType === "PACKAGE_PURCHASE" || a.incomeType === "AUTO_UPGRADE";
            const isBPurchase = b.incomeType === "PACKAGE_PURCHASE" || b.incomeType === "AUTO_UPGRADE";

            if (timeDiff <= 60) {
              if (isAPurchase !== isBPurchase) {
                return isAPurchase ? -1 : 1;
              }

              const aPkg = a.packageId || 0;
              const bPkg = b.packageId || 0;
              if (aPkg !== bPkg) return aPkg - bPkg;

              const aAmt = parseFloat(a.amount.replace(/[^0-9.]/g, "") || "0");
              const bAmt = parseFloat(b.amount.replace(/[^0-9.]/g, "") || "0");
              if (aAmt !== bAmt) return aAmt - bAmt;
            }

            return b.rawDate - a.rawDate;
          });
          setRecentActivity(sortedItems);
        }
      })
      .catch((error) => {
        console.error("Error loading global income activity:", error);
        if (active) setRecentActivity([]);
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, []);

  const filteredActivity = recentActivity.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.incomeType === activeFilter;
  });
  const pendingItems = filteredActivity.filter(isPendingIncome);

  const counts = {
    ALL: recentActivity.length,
    SPONSOR: recentActivity.filter((i) => i.incomeType === "SPONSOR").length,
    LEVEL: recentActivity.filter((i) => i.incomeType === "LEVEL").length,
    MATRIX: recentActivity.filter((i) => i.incomeType === "MATRIX").length,
    PACKAGE_PURCHASE: recentActivity.filter((i) => i.incomeType === "PACKAGE_PURCHASE").length,
    AUTO_UPGRADE: recentActivity.filter((i) => i.incomeType === "AUTO_UPGRADE").length,
  };

  const filterTabs: { id: ActivityFilterType; label: string; count: number }[] = [
    { id: "ALL", label: "All Activity", count: counts.ALL },
  ];

  return (
    <div className="grid gap-2 grid-cols-1 xl:grid-cols-8">
      <div className="rounded-3xl order-2 xl:order-1 col-span-1 xl:col-span-5 border border-white/10 bg-[#13131C] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Platform Recent Activity
            </h2>

          </div>
        </div>

        {/* Filter Navigation Tabs */}
        {/* <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeFilter === tab.id
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              {tab.label}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === tab.id ? "bg-black/20 text-black font-bold" : "bg-white/10 text-gray-400"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div> */}

        <div className="mt-5 space-y-3 max-h-150 overflow-y-auto">
          {isLoading ? (
            <div className="rounded-2xl bg-[#1F1F2C] p-6 text-center text-sm text-gray-400 animate-pulse">
              Loading recent platform activity...
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="rounded-2xl bg-[#1F1F2C] p-6 text-center text-sm text-gray-400">
              No recent activity recorded for {filterTabs.find((t) => t.id === activeFilter)?.label}.
            </div>
          ) : (
            <>
              {filteredActivity.map((item) => {
                const config = getItemConfig(item);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#1F1F2C] p-4 transition-colors hover:bg-[#252535]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.bgColor}`}>
                        {config.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="wrap-break-words text-sm font-semibold text-white">{config.title}</p>
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeBg}`}>
                            {config.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{config.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <span className={`text-sm font-bold ${config.amountColor}`}>{config.amountFormatted}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-300">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {formatTimeAgo(item.time)}
                        {/* {item.time} */}
                      </span>
                    </div>
                  </div>
                );
              })}

              {pendingItems.length > 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#1F1F2C] p-4 text-center text-sm text-gray-400 mt-4">
                  {pendingItems.length} pending transaction{pendingItems.length === 1 ? "" : "s"}:
                </div>
              )}

              {pendingItems.map((item) => {
                const config = getItemConfig(item);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-yellow-500/20 bg-[#1F1F2C] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        {config.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="wrap-break-words text-sm font-semibold text-white">{config.title}</p>
                          <span className="inline-block rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3">
                      <span className="text-sm font-bold text-yellow-400">{item.amount}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-300">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimeAgo(item.time)}
                        {/* {item.time} */}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="rounded-3xl order-1 xl:order-2 col-span-1 xl:col-span-3 bg-[#212123c9] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Platform stats</h3>
            <p className="mt-1 text-sm text-gray-400">Quick snapshot of platform totals.</p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {platformStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-[#292930] p-4">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="mt-3 text-xl font-semibold text-white">{stat.value}</p>
                <span className="text-sm self-end font-semibold text-emerald-400">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
