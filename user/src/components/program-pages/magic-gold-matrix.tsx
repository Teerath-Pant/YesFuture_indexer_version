import { MatrixGridXGold } from "@/components/matrix-grid-x-gold";
import { type LevelDataXGold } from "@/components/matrix-level-card-x-gold";
import { ProgramPageHeader } from "@/components/programe-page-header";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import {
  magicGoldMatrixPackages,
  type ProgramTypes,
} from "@/constants/programs";
import {
  fetchPackageAndId,
  fetchPurchaseHistory,
  fetchMagicGoldMatrixSummary,
  fetchMaxActiveMatrixPackage,
} from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";

interface pageProps {
  program?: ProgramTypes;
  accentColor?: string;
  walletAddress?: string;
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

const MagicGoldMatrix = ({ program, walletAddress }: pageProps) => {
  const { address } = useWallet();
  const activeWalletAddress = walletAddress || address;
  // const [_page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userNumericId, setUserNumericId] = useState("0");
  const [maxActivePkg, setMaxActivePkg] = useState(1);
  const [_purchaseHistory, setPurchaseHistory] = useState<TransactionRow[]>([]);
  const [packageMetrics, setPackageMetrics] = useState<
  Record<
    number,
    {
      partnersCount: number;
      level5Count: number;
      recycleCount: number;
      tree?: LevelDataXGold["tree"];
      revenue?: number;
    }
  >
>({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const packagePrices = magicGoldMatrixPackages; // Assuming this is defined elsewhere in your code

  useEffect(() => {
    async function loadAllData() {
      if (!activeWalletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { numericId, stringId } =
          await fetchPackageAndId(activeWalletAddress);
        setUserNumericId(stringId);

        const activeMax = await fetchMaxActiveMatrixPackage(activeWalletAddress);
        // const activeMax = await fetchMaxActivePackage(activeWalletAddress);
        setMaxActivePkg(Math.max(activeMax, 1));
        const unlockedMax = Math.max(activeMax, 1);
        const summary = await fetchMagicGoldMatrixSummary(activeWalletAddress);
        const metricsMap: Record<number, any> = {};
        let allTimeRevenue = 0;
        for (let i = 1; i <= 9; i++) {
          const details = summary[i] ?? {
            partnersCount: 0,
            level5Count: 0,
            recycleCount: 0,
            tree: [],
            revenue: 0,
          };
          metricsMap[i] = details;
          if (i <= unlockedMax) {
            allTimeRevenue += details.revenue ?? 0;
          }
        }
        setPackageMetrics(metricsMap);
        setTotalRevenue(allTimeRevenue);
        const historyData = await fetchPurchaseHistory(activeWalletAddress);
        const currentPkg = Math.max(activeMax, 1);
        const formattedHistory: TransactionRow[] = historyData
          .filter(
            (item: any) =>
              item.track === "MATRIX" && Number(item.packageId) === currentPkg,
          )
          .map((item: any, idx: number) => ({
            id: idx + 1,
            date: item.date,
            refId: numericId,
            level: Number(item.packageId) || 1,
            wallet: `${activeWalletAddress.substring(0, 6)}...${activeWalletAddress.substring(activeWalletAddress.length - 4)}`,
            fullWallet: activeWalletAddress,
            type: "join",
            amount: item.amount,
          }));
        setPurchaseHistory(formattedHistory);
      } catch (err) {
        console.error("Error loading matrix block data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [activeWalletAddress]);

  // Dynamically generate the 9 levels matching your smart contract structure
  const levelsData: LevelDataXGold[] = packagePrices.map((price, index) => {
    const pkgLevel = index + 1;
    // Explicitly check if package level is less than or equal to maxActivePkg fetched from contract
    const isUnlocked = pkgLevel <= maxActivePkg;
    const metrics = packageMetrics[pkgLevel] || {
      partnersCount: 0,
      level5Count: 0,
      recycleCount: 0,
      tree: [],
    };

    const hasDownlinePurchasedUpper =
      !isUnlocked &&
      ((metrics.partnersCount ?? 0) > 0 ||
        (metrics.level5Count ?? 0) > 0 ||
        (metrics.revenue ?? 0) > 0);

    return {
      level: pkgLevel,
      price: price,
      isUnlocked: isUnlocked,
      partnersCount: metrics.partnersCount,
      recycleCount: metrics.recycleCount,
      revenue: metrics.revenue,
      isDamage: hasDownlinePurchasedUpper,
      tree: metrics.tree && metrics.tree.length > 0 ? metrics.tree : [],
    } as LevelDataXGold;
  });
  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userNumericId}
        programName={program}
        activeLevelsCount={maxActivePkg}
        totalLevelsCount={9}
        totalProfit={`${totalRevenue.toLocaleString()} USDT`}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading independent
          package matrices...
        </div>
      ) : (
        <>
          <MatrixGridXGold levels={levelsData} />
        </>
      )}
    </div>
  );
};

export default MagicGoldMatrix;