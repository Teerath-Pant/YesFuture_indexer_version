import { RefreshCw, User, Gift } from "lucide-react";
import DataTable, { type Column } from "../data-table";
import WalletCell from "../wallet-cell";
import LevelPageLayout from "../level-page-layout";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MatrixTreeCardXGold, { type TreeNode } from "../matrix-tree-card-x-gold";
import {
  buildDetailedTreeRows,
  type ApiMatrixLevel,
} from "@/lib/parse-matrix-tree";
import { useWallet } from "@/lib/use-wallet";
import {
  fetchMagicGoldMatrixStructure,
  fetchMatrixPackagePrice,
  fetchPackageAndId,
  fetchPackageMatrixDetails,
  fetchMemberIdsForAddresses,
  fetchUserMatrixIncomeHistory,
} from "@/lib/auth-api";
import type { ProgramTypes } from "@/constants/programs";
import { formattedWalletAddress } from "@/lib/helper";

interface TransactionRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "bonus" | "release";
  amount: string;
  amountValue?: number;
}

const EMPTY_XGOLD_TREE: TreeNode[][] = [
  Array(2).fill({ slot: "empty" }),
  Array(4).fill({ slot: "empty" }),
  Array(8).fill({ slot: "empty" }),
  Array(16).fill({ slot: "empty" }),
  Array(32).fill({ slot: "empty" }),
];

export const XGoldLevelPage = ({
  level,
  program,
}: {
  level: string;
  program: ProgramTypes;
}) => {
  const levelNum = Number(level);
  const { address } = useWallet();
  const isNavigating = useRouterState().status === "pending";
  const [cycle, setCycle] = useState(1);
  // const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // real app me ye SAMPLE_XGOLD_LEVEL_1 ki jagah backend se aaya
  // response (props/query) hoga — builder waisa hi rahega
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(true);
  const [ownerId, setOwnerId] = useState("...");
  const [uplineId, setUplineId] = useState("...");
  const [tree, setTree] = useState<TreeNode[][]>(EMPTY_XGOLD_TREE);
  const [partnersCount, setPartnersCount] = useState(0);
  const [cyclesCount, setCyclesCount] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState("0 USDT");
  const [coinCount, setCoinCount] = useState(0);
  const [incomeRows, setIncomeRows] = useState<TransactionRow[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadMatrixStructure() {
      if (!address || !levelNum) {
        setIsLoadingMatrix(false);
        return;
      }

      setIsLoadingMatrix(true);
      try {
        // Clicking a filled node navigates here with ?id=<stringId> to preview that
        // member's own matrix — resolve it to an address, else fall back to the
        // connected wallet (normal, non-preview view).
        const targetAddress = address;

        if (!targetAddress) {
          if (!isCancelled) setIsLoadingMatrix(false);
          return;
        }

        const [profile, metrics, price, structure] = await Promise.all([
          fetchPackageAndId(targetAddress),
          fetchPackageMatrixDetails(targetAddress, levelNum),
          fetchMatrixPackagePrice(levelNum),
          fetchMagicGoldMatrixStructure(
            targetAddress,
            levelNum,
            Math.max(cycle - 1, 0),
          ),
        ]);

        // const visibleNodes = structure.nodes.slice(0, 62);
        // const idByAddress = await fetchMemberIdsForAddresses(visibleNodes);

        const visibleNodes = structure.nodeInfos.slice(0, 62);
        const idByAddress = await fetchMemberIdsForAddresses(
          structure.nodes.slice(0, 62),
        );
        const matrixIncomeRows = await fetchUserMatrixIncomeHistory(
          targetAddress,
          levelNum,
        );
        // const toNode = (nodeAddress: string): TreeNode => {
        //   if (!nodeAddress || nodeAddress === "0x0000000000000000000000000000000000000000") {
        //     return { slot: "empty" };
        //   }

        //   return {
        //     slot: "direct",
        //     id: idByAddress[nodeAddress.toLowerCase()] || undefined,
        //   };
        // };

        const toNode = (
          node: {
            address: string;
            isDirectPlacement: boolean;
            isInDownline: boolean;
          } | null,
        ): TreeNode => {
          if (!node) return { slot: "empty" };

          const slot: TreeNode["slot"] = node.isDirectPlacement
            ? "direct"
            : node.isInDownline
              ? "spilloverAbove"
              : "spilloverBelow";

          return {
            slot,
            id: idByAddress[node.address.toLowerCase()] || undefined,
          };
        };

        if (isCancelled) return;

        // structure.filledCount is the exact count for the selected cycle —
        // metrics.partnersCount is a different number (sum across ALL cycles),
        // so it can't be used as a fallback: a genuinely-empty selected cycle
        // (filledCount 0) would wrongly display the all-cycles total.
        const filledCount = structure.filledCount ?? 0;
        setOwnerId(profile.stringId || "...");
        setUplineId(profile.uplineId ?? "...");
        // setUplineId(
        //   structure.root && structure.root !== "0x0000000000000000000000000000000000000000"
        //     ? `${structure.root.slice(0, 6)}...${structure.root.slice(-4)}`
        //     : "Root",
        // );
        setTree([
          visibleNodes.slice(0, 2).map(toNode),
          visibleNodes.slice(2, 6).map(toNode),
          visibleNodes.slice(6, 14).map(toNode),
          visibleNodes.slice(14, 30).map(toNode),
          visibleNodes.slice(30, 62).map(toNode),
        ]);
        setPartnersCount(filledCount);
        setCyclesCount(Math.max(metrics.recycleCount || 0, 1));
        setCoinCount(price);
        setIncomeRows(matrixIncomeRows);
        // matrixIncomeRows sums ALL matrix income (MatrixIncome events carry no
        // packageId, can't be filtered by package — see fetchUserMatrixIncomeHistory).
        // metrics.revenue is the exact current-package total (tx_hash-joined
        // against the purchase event, see /users/:address/matrix-income-total/:packageId).
        setTotalRevenue(`${(metrics.revenue ?? 0).toLocaleString()} USDT`);
      } catch (error) {
        console.error("Error loading magic gold matrix level:", error);
      } finally {
        if (!isCancelled) setIsLoadingMatrix(false);
      }
    }

    loadMatrixStructure();

    return () => {
      isCancelled = true;
    };
  }, [address, cycle, levelNum]);

  const getRowIcon = (row: TransactionRow) => {
    if (row.type === "release")
      return <RefreshCw size={16} className="text-violet-400" />;
    if (row.type === "bonus")
      return <Gift size={16} className="text-amber-400" />;
    return <User size={16} className="text-gray-300" />;
  };

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-blue-400  px-2 py-1 rounded-full font-medium">
          ID {r.refId}
        </span>
      ),
    },
    { key: "level", label: "Level" },
    { key: "packageId", label: "Package" },
    {
      key: "wallet",
      label: "Wallet",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? ""}
          displayAddress={formattedWalletAddress(r.fullWallet ?? "")}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? ""}`}
        />
      ),
    },
    {
      key: "amount",
      label: "USDT",
      align: "right",
      render: (r) => (
        <span
          className={
            r.type === "release"
              ? "text-green-500 font-semibold"
              : "text-green-500 font-semibold"
          }
        >
          {r.amount}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full text-white">
      <LevelPageLayout
        breadcrumb={[
          { label: `ID ${ownerId}` },
          { label: program },
          { label: `Package ${level}` },
        ]}
        // title={`Package ${level}`}
        uplineId={`${uplineId}`}
        isLoading={isNavigating || isLoadingMatrix}
        level={{
          current: levelNum,
          totalLevels: 15,
          hasPrev: levelNum > 1,
          hasNext: levelNum < 15,
          onPrev: () =>
            navigate({
              to: "/dashboard/$program/$level",
              params: { program, level: String(levelNum - 1) },
            }),
          onNext: () =>
            navigate({
              to: "/dashboard/$program/$level",
              params: { program, level: String(levelNum + 1) },
            }),
        }}
        cycle={{
          current: cycle,
          totalCycles: cyclesCount,
          cycleLabel: `Cycle: ${cycle}`,
          hasPrev: cycle > 1,
          hasNext: cycle < cyclesCount,
          onPrev: () => setCycle((c) => Math.max(1, c - 1)),
          onNext: () => setCycle((c) => Math.min(cyclesCount, c + 1)),
          onSelect: setCycle,
        }}
        program={program}
      >
        <MatrixTreeCardXGold
          level={levelNum}
          ownerId={ownerId}
          coinCount={coinCount}
          tree={tree}
          partnersCount={partnersCount}
          cyclesCount={cyclesCount}
          totalRevenue={totalRevenue}
        />
      </LevelPageLayout>

      <div className="my-8">
        <DataTable<TransactionRow>
          columns={columns}
          data={incomeRows}
          getRowIcon={getRowIcon}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default XGoldLevelPage;
