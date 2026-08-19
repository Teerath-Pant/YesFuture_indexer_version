import { RefreshCw, User, Gift } from "lucide-react";
import DataTable, { type Column } from "@/components/data-table";
import WalletCell from "@/components/wallet-cell";
import LevelPageLayout from "@/components/level-page-layout";
import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MatrixTreeCardXGold, {
  type TreeNode,
} from "@/components/matrix-tree-card-x-gold";
import {
  buildDetailedTreeRows,
  type ApiMatrixLevel,
} from "@/lib/parse-matrix-tree";
import {
  fetchMagicGoldMatrixStructure,
  fetchMatrixPackagePrice,
  fetchPackageAndId,
  fetchPackageMatrixDetails,
  fetchMemberIdsForAddresses,
  fetchUserMatrixIncomeHistory,
  PreviewModeApiCall,
} from "@/lib/auth-api";
import type { ProgramTypes } from "@/constants/programs";

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

const SAMPLE_XGOLD_LEVEL_1: ApiMatrixLevel = {
  title: "xGold",
  level: 1,
  max_active_level: 8,
  user_id: 206248,
  cycle: 4,
  recycles: 3,
  descendants: 70,
  currency: "BUSD",
  revenue: 336,
  revenue_count: 88,
  ref_bonus_revenue: 0,
  missed_revenue: 0,
  missed_partners: 0,
  overtake: 0,
  freeze: false,
  active: true,
  upline_id: 84132,
  blockchain_last_block_number: 111808964,
  elements: [
    {
      user_id: 252550,
      level: 1,
      place: 1,
      active: true,
      is_stored_coin: false,
      is_leading_gift: false,
      is_reinvest: false,
      transaction_hash:
        "0xf40347b4c24185019ea6f9f61c2d273e8d80594887e0ff1b41e7c67bbba2c129",
      elements: [
        {
          user_id: 242016,
          level: 1,
          place: 3,
          active: true,
          is_stored_coin: false,
          is_leading_gift: false,
          is_reinvest: false,
          transaction_hash:
            "0x43d0cfe328bb34429955908d4cb4afb17d44a6127a2385495bd0e3762a324974",
          elements: [
            {
              user_id: 222818,
              level: 1,
              place: 7,
              active: true,
              is_stored_coin: false,
              is_leading_gift: false,
              is_reinvest: false,
              transaction_hash:
                "0xc489050d6629fba883d2f32194e60b237b621b01c035b56655e2c1ce07c941e4",
              elements: [
                { level: 1, place: 15, active: false },
                { level: 1, place: 16, active: false },
              ],
            },
            {
              level: 1,
              place: 8,
              active: false,
              elements: [
                { level: 1, place: 17, active: false },
                { level: 1, place: 18, active: false },
              ],
            },
          ],
        },
        {
          user_id: 246358,
          level: 1,
          place: 4,
          active: true,
          overflow: "bottom",
          is_stored_coin: false,
          is_leading_gift: false,
          is_reinvest: false,
          transaction_hash:
            "0xfdc2256bcf1afd8b83da5c625d15ca6fb7f1ff99e1d50c7ff8c90db960f02a18",
          elements: [
            {
              user_id: 266627,
              level: 1,
              place: 9,
              active: true,
              is_stored_coin: false,
              is_leading_gift: false,
              is_reinvest: false,
              transaction_hash:
                "0xc87fc26d051e8d24f48a8a87a3cba8242f3558cae2139d707b82f94f354e664e",
              elements: [
                { level: 1, place: 19, active: false },
                { level: 1, place: 20, active: false },
              ],
            },
            {
              level: 1,
              place: 10,
              active: false,
              elements: [
                { level: 1, place: 21, active: false },
                { level: 1, place: 22, active: false },
              ],
            },
          ],
        },
      ],
    },
    {
      user_id: 249833,
      level: 1,
      place: 2,
      active: true,
      is_stored_coin: false,
      is_leading_gift: false,
      is_reinvest: false,
      transaction_hash:
        "0x39e9a8ce22cf9f713d1016c21435f6a82034a910e3718a4c4d02f07270aadc78",
      elements: [
        {
          user_id: 252735,
          level: 1,
          place: 5,
          active: true,
          is_stored_coin: false,
          is_leading_gift: false,
          is_reinvest: false,
          transaction_hash:
            "0x127a2ccfabd749e2dd3afbce09774ced087c7374791f0c5c8fc1b07c168ec280",
          elements: [
            {
              user_id: 210692,
              level: 1,
              place: 11,
              active: true,
              is_stored_coin: false,
              is_leading_gift: false,
              is_reinvest: false,
              transaction_hash:
                "0xe6d832b371ba6e9303c722a966c29ccf891d6108d7685a130932b1e84bb68656",
              elements: [
                {
                  user_id: 259175,
                  level: 1,
                  place: 23,
                  active: true,
                  overflow: "bottom",
                  transaction_hash:
                    "0xb1705c7c832d6261e61a2803909ffa576a6b28b2e270ec6053517bbe315bd43e",
                },
                {
                  user_id: 259173,
                  level: 1,
                  place: 24,
                  active: true,
                  overflow: "bottom",
                  transaction_hash:
                    "0x81f113f5c8ddf53e49d79cfb9fa042fddadb9916efdf47cfbe276e77284ab59e",
                },
              ],
            },
            {
              level: 1,
              place: 12,
              active: false,
              elements: [
                { level: 1, place: 25, active: false },
                { level: 1, place: 26, active: false },
              ],
            },
          ],
        },
        {
          user_id: 248638,
          level: 1,
          place: 6,
          active: true,
          overflow: "bottom",
          is_stored_coin: false,
          is_leading_gift: false,
          is_reinvest: false,
          transaction_hash:
            "0xef614853d5034499365bb26ac4d78bb272bd673294091acf1403472cdd6a3f87",
          elements: [
            {
              user_id: 414760,
              level: 1,
              place: 13,
              active: true,
              is_stored_coin: false,
              is_leading_gift: false,
              is_reinvest: false,
              transaction_hash:
                "0x21c36c4d2c28165ebba13780dedebbe123a2e1ebcb7706faa2068b8ed3fe9e23",
              elements: [
                { level: 1, place: 27, active: false },
                { level: 1, place: 28, active: false },
              ],
            },
            {
              level: 1,
              place: 14,
              active: false,
              elements: [
                { level: 1, place: 29, active: false },
                { level: 1, place: 30, active: false },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const PreviewMagicGoldMatrixLevelPackagePage = ({
  level,
  program,
}: {
  level: string;
  program: ProgramTypes;
}) => {
  const { id: previewId } = useSearch({ from: "/preview" });
  const levelNum = Number(level);
  const isNavigating = useRouterState().status === "pending";
  const [cycle, setCycle] = useState(1);
  // const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // real app me ye SAMPLE_XGOLD_LEVEL_1 ki jagah backend se aaya
  // response (props/query) hoga — builder waisa hi rahega
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(true);
  const [ownerId, setOwnerId] = useState("...");
  const [uplineId, setUplineId] = useState("...");
  const [tree, setTree] = useState<TreeNode[][]>(
    buildDetailedTreeRows(SAMPLE_XGOLD_LEVEL_1.elements, 4),
  );
  const [partnersCount, setPartnersCount] = useState(0);
  const [cyclesCount, setCyclesCount] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState("0 USDT");
  const [coinCount, setCoinCount] = useState(0);
  const [incomeRows, setIncomeRows] = useState<TransactionRow[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadMatrixStructure() {
      if (!previewId || !levelNum) {
        setIsLoadingMatrix(false);
        return;
      }

      setIsLoadingMatrix(true);
      try {
        if (!previewId) {
          if (!isCancelled) setIsLoadingMatrix(false);
          return;
        }

        const [profile, metrics, price, structure] = await Promise.all([
          PreviewModeApiCall(previewId, fetchPackageAndId),
          PreviewModeApiCall(previewId, fetchPackageMatrixDetails, levelNum),
          fetchMatrixPackagePrice(levelNum),
          PreviewModeApiCall(
            previewId,
            fetchMagicGoldMatrixStructure,
            levelNum,
            Math.max(cycle - 1, 0),
          ),
        ]);

        // const visibleNodes = structure?.nodes.slice(0, 62);
        const visibleNodes = structure?.nodes.slice(0, 62) ?? [];
        const idByAddress = await fetchMemberIdsForAddresses(visibleNodes, levelNum);
        const matrixIncomeRows = await PreviewModeApiCall(
          previewId,
          fetchUserMatrixIncomeHistory,
          levelNum,
        );
        const toNode = (nodeAddress: string): TreeNode => {
          if (
            !nodeAddress ||
            nodeAddress === "0x0000000000000000000000000000000000000000"
          ) {
            return { slot: "empty" };
          }

          return {
            slot: "direct",
            id: idByAddress[nodeAddress.toLowerCase()] || undefined,
          };
        };

        if (isCancelled) return;

        const filledCount =
          structure?.filledCount ?? metrics?.partnersCount ?? 0;
        // const filledCount = structure.filledCount || metrics.partnersCount || 0;
        setOwnerId(profile?.stringId || "...");
        // setUplineId(
        //   structure.root &&
        //     structure.root !== "0x0000000000000000000000000000000000000000"
        //     ? `${structure.root.slice(0, 6)}...${structure.root.slice(-4)}`
        //     : "Root",
        // );
        setUplineId(
          structure?.root &&
            structure.root !== "0x0000000000000000000000000000000000000000"
            ? `${structure.root.slice(0, 6)}...${structure.root.slice(-4)}`
            : "Root",
        );
        setTree([
          visibleNodes.slice(0, 2).map(toNode),
          visibleNodes.slice(2, 6).map(toNode),
          visibleNodes.slice(6, 14).map(toNode),
          visibleNodes.slice(14, 30).map(toNode),
          visibleNodes.slice(30, 62).map(toNode),
        ]);
        setPartnersCount(filledCount);
        setCyclesCount(Math.max(metrics?.recycleCount || 0, 1));
        setCoinCount(price);
        setIncomeRows(matrixIncomeRows ?? []);
        // matrixIncomeRows sums ALL matrix income (MatrixIncome events carry no
        // packageId — see fetchUserMatrixIncomeHistory). metrics.revenue is the
        // exact current-package total (tx_hash-joined against the purchase event).
        setTotalRevenue(`${(metrics?.revenue ?? 0).toLocaleString()} USDT`);
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
  }, [previewId, cycle, levelNum]);

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
        <span className="text-blue-400 font-medium px-2 py-1 rounded-full">
          {r.refId}
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
        <span
          className={r.type === "release" ? "text-green-500 font-semibold" : "text-green-500 font-semibold"}
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
        title={`Package ${level}`}
        uplineId={`Upline ${uplineId}`}
        isLoading={isNavigating || isLoadingMatrix}
        level={{
          current: levelNum,
          totalLevels: 10,
          hasPrev: levelNum > 1,
          hasNext: levelNum < 10,
          onPrev: () =>
            navigate({
              to: "/preview/dashboard/$program/$level",
              params: { program, level: String(levelNum - 1) },
              search: { id: previewId },
            }),
          onNext: () =>
            navigate({
              to: "/preview/dashboard/$program/$level",
              params: { program, level: String(levelNum + 1) },
              search: { id: previewId },
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

export default PreviewMagicGoldMatrixLevelPackagePage;
