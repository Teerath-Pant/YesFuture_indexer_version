import DataTable, { type Column } from "../data-table";
import TableSkeleton from "@/components/skeletons/table-skeleton";
import LevelPageLayout from "../level-page-layout";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { magicLevelPackages, type ProgramTypes } from "@/constants/programs";
import MagicLevelSummaryCard from "../magic-level-summary-card";
import { useWallet } from "@/lib/use-wallet";
import { useEffect, useState } from "react";
import {
  fetchUserStringId,
  fetchLevelPurchasers,
} from "@/lib/auth-api";
import WalletCell from "../wallet-cell";

const SPONSOR_PACKAGE_PRICES = magicLevelPackages;
const MAX_LEVEL = 10;

interface TeamMemberRow {
  id: number;
  stringId: string;
  wallet: string;
  fullWallet: string;
  joinDate: string;
}

export const MagicLevelPackagePage = ({
  level,
  program,
}: {
  level: string;
  program: ProgramTypes;
}) => {
  const navigate = useNavigate();
  const { address } = useWallet();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState("0 USDT");
  const packageNum = Number(level) || 1;
  const search: Record<string, string> = useSearch({ strict: false }) || {};
  const [uplineId, setUplineId] = useState("NONE");
  const currentTeamLevel = Math.min(
    MAX_LEVEL,
    Math.max(1, Number(search.level) || 1),
  );

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      if (!address) {
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      try {
        const [user_id, purchasers] = await Promise.all([
          fetchUserStringId(address),
          fetchLevelPurchasers(address, currentTeamLevel, packageNum),
        ]);

        if (!isCancelled) {
          setUserId(user_id);
          setUplineId(purchasers.uplineStringId);

          const rows: TeamMemberRow[] = purchasers.rows.map((row) => ({
            id: row.id,
            stringId: row.refId,
            wallet: row.wallet,
            fullWallet: row.fullWallet,
            joinDate: row.date,
          }));

          setTeamMembers(rows);
          setTotalRevenue(`${Number(purchasers.totalRevenue).toFixed(3)} USDT`);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!isCancelled) setIsDataLoading(false);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [address, currentTeamLevel, packageNum]);

  const coinValue = SPONSOR_PACKAGE_PRICES[packageNum - 1] || packageNum;

  const columns: Column<TeamMemberRow>[] = [
    { key: "stringId", label: "ID" },
    {
      key: "wallet",
      label: "Wallet Address",
      render: (r) => (
        // <span className="text-sm text-gray-300" title={r.fullWallet}>
        //   {r.wallet}
        // </span>
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    { key: "joinDate", label: "Join Date", align: "right" },
  ];

  const goToLevel = (nextLevel: number) => {
    setIsDataLoading(true); // 👈 click hote hi skeleton turant dikhega
    navigate({
      to: "/dashboard/$program/$level",
      params: { program, level: level },
      search: (prev) => ({ ...prev, level: String(nextLevel) }),
    });
  };

  return (
    <div className="w-full text-white">
      <LevelPageLayout
        breadcrumb={[
          { label: `ID ${userId || "..."}` },
          { label: program },
          { label: `Package ${packageNum}` },
        ]}
        title={`Level ${currentTeamLevel}`}
        uplineId={uplineId}
        isLoading={isDataLoading}
        package={{
          current: currentTeamLevel,
          totalPackages: MAX_LEVEL,
          hasPrev: currentTeamLevel > 1,
          hasNext: currentTeamLevel < MAX_LEVEL,
          onPrev: () => goToLevel(currentTeamLevel - 1),
          onNext: () => goToLevel(currentTeamLevel + 1),
        }}
        program={program}
      >
        {
          <MagicLevelSummaryCard
            level={currentTeamLevel}
            id={userId}
            coinCount={coinValue}
            partnersCount={teamMembers.length}
            totalRevenue={totalRevenue}
          />
        }
      </LevelPageLayout>

      <div className="my-8">
        {isDataLoading ? (
          <TableSkeleton columns={columns.length} />
        ) : (
          <DataTable<TeamMemberRow>
            columns={columns}
            data={teamMembers}
            getRowKey={(row) => row.id}
            pageSize={10}
          />
        )}
      </div>
    </div>
  );
};

export default MagicLevelPackagePage;
