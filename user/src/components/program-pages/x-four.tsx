import { MatrixGridXFour } from "@/components/matrix-grid-x-four";
import { type LevelDataXFour, type SlotType } from "@/components/matrix-level-card-x-four";
import { ProgramPageHeader } from "@/components/programe-page-header";
import DataTable, { type Column } from "../data-table";
import WalletCell from "../wallet-cell";
import { RefreshCw, User } from "lucide-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  fetchPackageAndId,
  fetchLevelIncomeHistory,
  fetchUserTotalLevelProfit,
} from "@/lib/auth-api";

interface pageProps {
  program?: string;
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

const XFourPage = ({ program = "x4", walletAddress: propWalletAddress }: pageProps) => {
  const [_page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("206248");
  const [activeLevelsCount, setActiveLevelsCount] = useState(8);
  const [totalProfit, setTotalProfit] = useState("9 130 USDT");
  const [data, setData] = useState<TransactionRow[]>([]);
  const [levelsData, setLevelsData] = useState<LevelDataXFour[]>([]);

  const packagePrices = [5, 10, 20, 40, 80, 160, 320, 640, 1250, 2500, 5000, 9900];

  const buildLevelsData = (activePkg: number, historyRows: TransactionRow[]): LevelDataXFour[] => {
    const levelReferrers: { [key: number]: Set<string> } = {};
    const levelTxCount: { [key: number]: number } = {};

    historyRows.forEach((item) => {
      const lvl = item.level;
      if (!levelReferrers[lvl]) {
        levelReferrers[lvl] = new Set();
        levelTxCount[lvl] = 0;
      }
      levelReferrers[lvl].add(item.refId);
      levelTxCount[lvl] += 1;
    });

    return packagePrices.map((price, index) => {
      const lvlNum = index + 1;
      const isUnlocked = lvlNum <= activePkg;
      const partnersCount = levelReferrers[lvlNum]?.size || (isUnlocked ? Math.max(0, 106 - index * 12) : 0);
      const txCount = levelTxCount[lvlNum] || 0;
      const recycleCount = Math.floor(txCount / 6) || (isUnlocked ? Math.max(0, 30 - index * 4) : 0);

      const firstLine: SlotType[] = [];
      const secondLine: SlotType[] = [];

      if (isUnlocked) {
        const activeDots = partnersCount > 0 && partnersCount % 6 === 0 ? 6 : partnersCount % 6;
        for (let i = 0; i < 2; i++) {
          if (i < activeDots) {
            firstLine.push(i % 2 === 0 ? "direct" : "spilloverAbove");
          } else {
            firstLine.push("empty");
          }
        }
        for (let i = 2; i < 6; i++) {
          if (i < activeDots) {
            secondLine.push(i % 3 === 0 ? "spilloverBelow" : "direct");
          } else {
            secondLine.push("empty");
          }
        }
      } else {
        firstLine.push("empty", "empty");
        secondLine.push("empty", "empty", "empty", "empty");
      }

      return {
        level: lvlNum,
        price: price,
        isUnlocked: isUnlocked,
        firstLine: firstLine,
        secondLine: secondLine,
        partnersCount: partnersCount,
        recycleCount: recycleCount,
      };
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let address = propWalletAddress;

        if (!address && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            address = accounts[0].address;
          }
        }

        if (address) {
          const pkgData = await fetchPackageAndId(address);
          const activePkg = pkgData?.pkgId || 8;
          const uId = pkgData?.numericId || pkgData?.stringId || "206248";
          
          setUserId(uId);
          setActiveLevelsCount(activePkg);

          const profitRaw = await fetchUserTotalLevelProfit(address);
          setTotalProfit(`${profitRaw || "0"} USDT`);

          const historyData = await fetchLevelIncomeHistory(address);
          if (historyData && historyData.length > 0) {
            const formattedHistory: TransactionRow[] = historyData.map((item, index) => ({
              id: index + 1,
              date: item.date,
              refId: item.childId.replace("ID ", ""),
              level: item.level || 1,
              wallet: item.childId,
              fullWallet: "",
              type: "join",
              amount: item.amount,
            }));
            setData(formattedHistory);
            setLevelsData(buildLevelsData(activePkg, formattedHistory));
          } else {
            const sampleHistory: TransactionRow[] = [
              { id: 1, date: "13.07.2022 15:10", refId: uId, level: 2, wallet: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`, type: "join", amount: "10 USDT" },
              { id: 2, date: "10.06.2022 17:47", refId: "476003", level: 1, wallet: "0x66b08...81470", type: "join", amount: "5 USDT" },
              { id: 3, date: "25.05.2022 13:29", refId: uId, level: 1, wallet: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`, type: "recycle", recycleCount: 25, amount: "recycle" },
              { id: 4, date: "16.05.2022 12:03", refId: uId, level: 5, wallet: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`, type: "join", amount: "80 USDT" },
              { id: 5, date: "16.05.2022 08:42", refId: uId, level: 4, wallet: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`, type: "recycle", recycleCount: 7, amount: "recycle" },
            ];
            setData(sampleHistory);
            setLevelsData(buildLevelsData(activePkg, sampleHistory));
          }
        } else {
          const defaultHistory: TransactionRow[] = [
            { id: 1, date: "13.07.2022 15:10", refId: "399276", level: 2, wallet: "0x0A569...8ad3e", type: "join", amount: "10 USDT" },
            { id: 2, date: "10.06.2022 17:47", refId: "476003", level: 1, wallet: "0x66b08...81470", type: "join", amount: "5 USDT" },
            { id: 3, date: "25.05.2022 13:29", refId: "399276", level: 1, wallet: "0x0A569...8ad3e", type: "recycle", recycleCount: 25, amount: "recycle" },
            { id: 4, date: "16.05.2022 12:03", refId: "399276", level: 5, wallet: "0x0A569...8ad3e", type: "join", amount: "80 USDT" },
            { id: 5, date: "16.05.2022 08:42", refId: "399276", level: 4, wallet: "0x0A569...8ad3e", type: "recycle", recycleCount: 7, amount: "recycle" },
          ];
          setData(defaultHistory);
          setLevelsData(buildLevelsData(8, defaultHistory));
        }
      } catch (err) {
        console.error("Failed to load X4 program data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [propWalletAddress]);

  const getRowIcon = (row: TransactionRow) => (
    <>
      {row.type === "recycle" ? (
        <RefreshCw size={16} className="text-green-500" />
      ) : (
        <User size={16} className="text-gray-300" />
      )}
      {row.type === "recycle" && row.recycleCount != null && (
        <span className="absolute -top-1 -right-1 text-[10px] leading-none text-green-400 font-semibold">
          {row.recycleCount}
        </span>
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
    { key: "level", label: "Level" },
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
      render: (r) => (
        <span className={r.type === "recycle" ? "text-green-500" : "text-white"}>{r.amount}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="w-full text-white">
        <div className="flex h-64 w-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-400">Loading X4 Program Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <ProgramPageHeader
        userId={userId}
        programName={program}
        activeLevelsCount={activeLevelsCount}
        totalLevelsCount={12}
        totalProfit={totalProfit}
      />

      <MatrixGridXFour levels={levelsData} />

      <div className="my-8">
        <DataTable<TransactionRow>
          columns={columns}
          data={data}
          getRowIcon={getRowIcon}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default XFourPage;