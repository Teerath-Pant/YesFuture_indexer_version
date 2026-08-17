import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { fetchGlobalLeaderboard } from "@/lib/auth-api";
import { formatAmount, formattedWalletAddress } from "@/lib/helper";
import WalletCell from "../wallet-cell";

// ---------- Types ----------
interface LeaderRow {
  place: number;
  name: string;
  userId: string;
  fullWallet: string;
  partners: number;
  profit: number;
  avatarUrl?: string;
}

const PLACE_STYLES: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-500/25 to-amber-500/5",
  2: "bg-gradient-to-r from-slate-400/20 to-slate-400/5",
  3: "bg-gradient-to-r from-orange-700/25 to-orange-700/5",
};

function initials(name: string, userId: string) {
  const source = name || userId;
  return (
    source
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 1)
      .toUpperCase() || "?"
  );
}

// ---------- Page ----------
export default function LeaderboardPage() {
  return (
    <div className="text-white">
      <LeaderboardCard />
    </div>
  );
}

function LeaderboardCard() {
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchGlobalLeaderboard(100)
      .then((rows) => {
        if (!isMounted) return;
        setLeaders(rows);
      })
      .catch((error) => {
        console.error("Failed to load leaderboard data:", error);
        setLeaders([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/5 bg-[#212123c9]">
      {/* Card header */}
      <div className="flex items-center gap-4 bg-[#1A1A21] px-6 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-900/30">
          <Crown
            className="h-7 w-7 text-white"
            fill="currentColor"
            strokeWidth={1}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">Top 100 Leaders</h2>
          <p className="text-sm text-gray-500">
            Overview of your current programs activation
          </p>
        </div>
      </div>

      {/* <div className="grid grid-cols-[60px_1fr_100px_140px] items-center gap-2 px-6 py-3 text-xs uppercase tracking-wide text-gray-500 sm:grid-cols-[70px_1fr_120px_160px]">
        <span className="text-white text-bold">Place</span>
        <span className="text-white text-bold">User ID</span>
        <span className="text-white text-bold text-right sm:text-center">
          Partners
        </span>
        <span className="text-right text-white text-bold">Total Profit</span>
      </div>

      {isLoading ? (
        <div className="px-6 py-6 text-center text-sm text-gray-400">
          Loading leaderboard...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-140">
            {leaders.map((row) => (
              <div
                key={row.fullWallet}
                className={`grid grid-cols-[60px_1fr_100px_140px] items-center gap-2 border-t border-white/5 px-6 py-3.5 sm:grid-cols-[70px_1fr_120px_160px] ${
                  PLACE_STYLES[row.place] ?? ""
                }`}
              >
                <span className="text-sm text-gray-300">{row.place}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-sm font-semibold text-gray-300">
                    {initials(row.name, row.userId)}
                  </div>
                  <div className="min-w-0">
                    {row.name && (
                      <div className="flex items-center gap-1 truncate text-sm font-semibold">
                        {row.place === 1 && <span aria-hidden>➤</span>}
                        {row.name}
                        {row.place === 1 && (
                          <Crown
                            className="h-3.5 w-3.5 text-amber-400"
                            fill="currentColor"
                          />
                        )}
                      </div>
                    )}
                    <WalletCell
                      address={row.fullWallet}
                      displayAddress={formattedWalletAddress(row.fullWallet)}
                      explorerUrl={`https://bscscan.com/address/${row.fullWallet}`}
                    />
                  </div>
                </div>
                <span className="text-right text-sm text-gray-300 sm:text-center">
                  {row.partners}
                </span>
                <span className="text-right text-sm font-semibold">
                  {row.profit.toFixed(4)} USDT
                </span>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="overflow-x-auto">
        <div className="min-w-140">
          {/* Header ab yahan andar aa gaya */}
          <div className="grid grid-cols-[60px_1fr_100px_140px] items-center gap-2 px-6 py-3 text-xs uppercase tracking-wide text-gray-500 sm:grid-cols-[70px_1fr_120px_160px]">
            <span className="text-white text-bold">Place</span>
            <span className="text-white text-bold">User ID</span>
            <span className="text-white text-bold text-right sm:text-center">
              Partners
            </span>
            <span className="text-right text-white text-bold">
              Total Profit
            </span>
          </div>

          {isLoading ? (
            <div className="px-6 py-6 text-center text-sm text-gray-400">
              Loading leaderboard...
            </div>
          ) : (
            leaders.map((row) => (
              <div
                key={row.fullWallet}
                className={`grid grid-cols-[60px_1fr_100px_140px] items-center gap-2 border-t border-white/5 px-6 py-3.5 sm:grid-cols-[70px_1fr_120px_160px] ${
                  PLACE_STYLES[row.place] ?? ""
                }`}
              >
                <span className="text-sm text-gray-300">{row.place}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2A2A32] text-sm font-semibold text-gray-300">
                    {initials(row.name, row.userId)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate text-sm font-semibold">
                      {row.place === 1 && <span aria-hidden>➤</span>}
                      {row.name || row.userId}
                      {row.place === 1 && (
                        <Crown
                          className="h-3.5 w-3.5 text-amber-400"
                          fill="currentColor"
                        />
                      )}
                    </div>
                    <WalletCell
                      address={row.fullWallet}
                      displayAddress={formattedWalletAddress(row.fullWallet)}
                      showActions={false}
                    />
                  </div>
                </div>
                <span className="text-right text-sm text-gray-300 sm:text-center">
                  {row.partners}
                </span>
                <span className="text-right text-sm font-semibold">
                  {formatAmount(row.profit)} USDT
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
