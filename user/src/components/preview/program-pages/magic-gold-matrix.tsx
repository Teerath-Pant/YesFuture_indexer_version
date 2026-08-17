import { type LevelDataXGold } from "@/components/matrix-level-card-x-gold";
import { ProgramPageHeader } from "@/components/programe-page-header";
import DataTable, { type Column } from "@/components/data-table";
import WalletCell from "@/components/wallet-cell";
import { RefreshCw, User } from "lucide-react";
import { useState, useEffect } from "react";
import { magicGoldMatrixPackages, type ProgramTypes } from "@/constants/programs";
import { fetchPackageAndId, fetchPurchaseHistory, fetchPackageMatrixDetails, fetchMaxActivePackage, PreviewModeApiCall } from "@/lib/auth-api";
import { useSearch } from "@tanstack/react-router";
import { PreviewUserMatrixGridXGold } from "../magic-gold-matrix/matrix-grid-x-gold";

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

const PreviewUserMagicGoldMatrix = ({ program }: pageProps) => {
  const [_page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userNumericId, setUserNumericId] = useState("0");
  const [maxActivePkg, setMaxActivePkg] = useState(1);
  const [purchaseHistory, setPurchaseHistory] = useState<TransactionRow[]>([]);
  const [packageMetrics, setPackageMetrics] = useState<Record<number, { partnersCount: number; level5Count: number; recycleCount: number }>>({});

  const { id } = useSearch({ from: "/preview" });

const packagePrices = magicGoldMatrixPackages;

useEffect(() => {
  async function loadAllData() {
    if (!id) {
      setLoading(false);
      return;
    }
    const userId = id;
    try {
      setLoading(true);

      // 1. Get user numeric ID & max active package directly from contract mapping
      const pkg = await PreviewModeApiCall(userId, fetchPackageAndId);
      setUserNumericId(pkg?.numericId ?? "0");

      const activeMax = await PreviewModeApiCall(userId, fetchMaxActivePackage);
      const safeActiveMax = activeMax ?? 0;

      // Ensure at least package 1 is active if they are registered
      const maxActivePkg = Math.max(safeActiveMax, 1);
      setMaxActivePkg(maxActivePkg);

      // 2. Fetch specific matrix metrics for each package tier up to maxActivePkg
      const metricsMap: Record<number, any> = {};
      for (let i = 1; i <= 9; i++) {
        if (i <= maxActivePkg) {
          const metrics = await PreviewModeApiCall(
            userId,
            fetchPackageMatrixDetails,
            i,
          );
          metricsMap[i] = metrics ?? {
            partnersCount: 0,
            level5Count: 0,
            recycleCount: 0,
          };
        } else {
          metricsMap[i] = { partnersCount: 0, level5Count: 0, recycleCount: 0 };
        }
      }
      setPackageMetrics(metricsMap);

      // 3. Fetch History Logs. fetchPurchaseHistory returns every track — this
      // page is Matrix-only, current package's purchase only, not every package mixed.
      const historyData = await PreviewModeApiCall(userId, fetchPurchaseHistory);
      const safeHistoryData = historyData ?? [];

      const formattedHistory: TransactionRow[] = safeHistoryData
        .filter((item: any) => item.track === "MATRIX" && Number(item.packageId) === maxActivePkg)
        .map((item: any, idx: number) => ({
          id: idx + 1,
          date: item.date,
          refId: pkg?.numericId ?? "N/A",
          level: Number(item.packageId) || 1,
          wallet: userId,
          fullWallet: userId,
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
}, [id]);

  // Dynamically generate the 9 levels matching your smart contract structure
  const levelsData: LevelDataXGold[] = packagePrices.map((price, index) => {
    const pkgLevel = index + 1;
    // Explicitly check if package level is less than or equal to maxActivePkg fetched from contract
    const isUnlocked = pkgLevel <= maxActivePkg;
    const metrics = packageMetrics[pkgLevel] || { partnersCount: 0, level5Count: 0, recycleCount: 0 };

    const generateSlots = (startIndex: number, totalSlots: number) => {
      const slots: string[] = [];
      for (let s = 0; s < totalSlots; s++) {
        const globalSlotIndex = startIndex + s;
        slots.push(globalSlotIndex < metrics.level5Count ? "direct" : "empty");
      }
      return slots;
    };

    return {
      level: pkgLevel,
      price: price,
      isUnlocked: isUnlocked,
      partnersCount: metrics.partnersCount,
      recycleCount: metrics.recycleCount,
      isDamage: !isUnlocked,
      tree: isUnlocked ? [
        generateSlots(0, 2),
        generateSlots(2, 4),
        generateSlots(6, 8),
        generateSlots(14, 18)
      ] : []
    } as LevelDataXGold;
  });

  const getRowIcon = (row: TransactionRow) => (
    <>
      {row.type === "recycle" ? (
        <RefreshCw size={16} className="text-green-500" />
      ) : (
        <User size={16} className="text-gray-300" />
      )}
    </>
  );

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
          ID {r.refId}
        </span>
      ),
    },
    { key: "level", label: "Package Level" },
    {
      key: "wallet",
      label: "Wallet",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    {
      key: "amount",
      label: "USDT",
      align: "right",
      render: (r) => <span className="text-white">{r.amount}</span>,
    },
  ];

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userNumericId}
        programName={program}
        activeLevelsCount={maxActivePkg}
        totalLevelsCount={9}
        totalProfit="0 USDT"
      />

      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading independent package matrices...
        </div>
      ) : (
        <>
          <PreviewUserMatrixGridXGold levels={levelsData} />

          
          <div className="my-8">
            <DataTable<TransactionRow>
              columns={columns}
              data={purchaseHistory}
              getRowIcon={getRowIcon}
              getRowKey={(row) => row.id}
              pageSize={10}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PreviewUserMagicGoldMatrix;