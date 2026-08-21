import { type LevelData } from "@/components/preview/magic-level/magic-level-card";
import { ProgramPageHeader } from "@/components/programe-page-header";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchLevelIncomeHistory,
  fetchUserTotalLevelProfit,
  fetchLevelPackageAndIdWithMax,
  fetchLevelIncomeTotal,
} from "@/lib/auth-api";
import { toast } from "sonner";
import { magicLevelPackages, RootID } from "@/constants/programs";
import { useWallet } from "@/lib/use-wallet";
import { MagicLevelGrid } from "../magic-level/magic-level-grid";

interface pageProps {
  program?: string;
  accentColor?: string;
}

interface TransactionRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "recycle";
  recycleCount?: number;
  amount: string;
}

const MagicLevels = ({ program }: pageProps) => {
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [userStringId, setUserStringId] = useState("Loading...");
  const [_data, setData] = useState<TransactionRow[]>([]);
  const [totalIncome, setTotalIncome] = useState<string>("0");
  const [activeLevelsCount, setActiveLevelsCount] = useState(0);
  const [totalLevelsCount] = useState(9);
  const [levelsData, setLevelsData] = useState<LevelData[]>([]);
  const { address } = useWallet();
  const buildLevelsData = (
    currentPkg: number,
    isRootUser = false,
    totalAmountByPackage: { [key: number]: number } = {},
  ): LevelData[] => {
    const packagePrices = magicLevelPackages;
    const levels: LevelData[] = [];

    for (let i = 1; i <= 9; i++) {
      const isUnlocked = isRootUser || i <= currentPkg;
      const price = packagePrices[i - 1] || 0;
      const totalAmount = totalAmountByPackage[i] || 0;

      levels.push({
        level: i,
        price: price,
        isUnlocked: isUnlocked,
        totalAmount: totalAmount,
        isFreeze: isRootUser ? false : !isUnlocked,
        isDamage: isRootUser ? false : i > currentPkg + 1,
      });
    }

    return levels;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!address) {
          setLoading(false);
          return;
        }

        let pkgId = 1;
        let isRootUser = false;
        try {
          const pkgData = await fetchLevelPackageAndIdWithMax(address);
          setUserStringId(pkgData?.stringId || "ID ...");
          const cleanStrId = (pkgData?.stringId || "")
            .replace(/^ID\s*/i, "")
            .trim()
            .toUpperCase();
          isRootUser =
            !!pkgData?.isRoot ||
            pkgData?.numericId === "1" ||
            cleanStrId === RootID ||
            cleanStrId === "1";
          pkgId = isRootUser ? 9 : pkgData?.pkgId || 1;
          setActiveLevelsCount(pkgId);
        } catch (err) {
          toast.error("Could not fetch member string ID");
          setUserStringId("ID ...");
        }

        const [history, total] = await Promise.all([
          fetchLevelIncomeHistory(address),
          fetchUserTotalLevelProfit(address),
        ]);

        const safeHistory = history ?? [];
        const safeTotal = total ?? "0";

        const formattedData: TransactionRow[] = safeHistory.map(
          (item, index) => {
            return {
              id: index + 1,
              date: item.date || "Pending",
              refId: item.childId.replace("ID ", ""),
              level: item.level,
              wallet: item.childId,
              fullWallet: "",
              type: "join",
              amount: item.amount,
            };
          },
        );

        setData(formattedData);
        setTotalIncome(safeTotal);

        const unlockedMax = isRootUser ? 9 : pkgId;
        const totalsByPackage: { [key: number]: number } = {};
        await Promise.all(
          Array.from({ length: unlockedMax }, (_, i) => i + 1).map(async (i) => {
            totalsByPackage[i] = await fetchLevelIncomeTotal(address, i);
          }),
        );

        const levels = buildLevelsData(pkgId, isRootUser, totalsByPackage);
        setLevelsData(levels);
      } catch (err) {
        toast.error("❌ Failed to load level income data:");
        setError("Failed to load income data. Please try again.");
        setUserStringId("ID ...");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [address]);
  if (loading) {
    return (
      <div className="w-full text-white">
        <div className="flex h-64 w-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
          <span className="ml-2 text-gray-400">
            Loading Magic Level Income...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userStringId.replace("ID ", "")}
        programName={program || "Magic Level"}
        activeLevelsCount={activeLevelsCount}
        totalLevelsCount={totalLevelsCount}
        totalProfit={`${totalIncome} USDT`}
      />

      <MagicLevelGrid levels={levelsData} />
    </div>
  );
};

export default MagicLevels;