import { RefreshCw, User } from "lucide-react";
import DataTable, { type Column } from "@/components/data-table";
import WalletCell from "@/components/wallet-cell";
import LevelPageLayout from "@/components/level-page-layout";
import { useRouterState, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  fetchSponsorLevelDetail,
  PreviewModeApiCall,
  type SponsorLevelDetail,
  type SponsorLevelTransaction,
} from "@/lib/auth-api";
import SponsorLevelSummaryCard, {
  type PartnerSlot,
} from "@/components/sponser-level-summary-card";
import { sponsorMagicPackages, type ProgramTypes } from "@/constants/programs";
import { formattedWalletAddress } from "@/lib/helper";

const SPONSOR_PACKAGE_PRICES = sponsorMagicPackages;

const PreviewSponsorMagicPackagePage = ({
  level,
  program,
}: {
  level: string;
  program: ProgramTypes;
}) => {
  const { id: searchId } = useSearch({ from: "/preview" });
  const levelNum = Number(level);
  const isNavigating = useRouterState().status === "pending";
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SponsorLevelDetail | null>(null);
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        if (!searchId) {
          throw new Error("No user ID provided in the search parameters.");
        }

        if (!searchId) {
          if (isMounted) setLoading(false);
          return;
        }

        const res = await PreviewModeApiCall(
          searchId,
          fetchSponsorLevelDetail,
          levelNum,
        );
        console.log(res)
        if (isMounted && res) {
          setDetail(res);
          const total = Math.max(1, res.cyclesCount || 0);
          setCycle(total);
        }
      } catch (err) {
        console.error("Error loading sponsor level detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [levelNum, searchId]);

  const totalCyclesCount = Math.max(1, detail?.cyclesCount || 0);
  const activeCycle = Math.min(Math.max(1, cycle), totalCyclesCount);

  const activeCyclePartners = detail?.cyclePartnerIds?.[activeCycle - 1] || [];
  const partnerSlots: PartnerSlot[] = Array.from({ length: 5 }, (_, i) => {
    const partner = activeCyclePartners[i];
    if (partner) {
      const cleanId = partner.id.replace(/^ID\s*/i, "");
      return {
        id: cleanId,
        to: `/preview/dashboard/${program}/${levelNum}`, // sirf path
        searchId: cleanId,
        isHeld: partner.isHeld,
      };
    }
    return {};
  });

  const ownIdClean =
    detail?.ownStringId && detail.ownStringId !== "..."
      ? detail.ownStringId.replace(/^ID\s*/i, "")
      : searchId
        ? searchId.replace(/^ID\s*/i, "")
        : "...";

  const uplineIdClean = detail?.uplineStringId || "NONE";
  const uplineDisplay =
    uplineIdClean === "NONE"
      ? "NONE"
      : uplineIdClean.startsWith("ID")
        ? uplineIdClean
        : `ID ${uplineIdClean}`;

  const coinValue = SPONSOR_PACKAGE_PRICES[levelNum - 1] || levelNum;

  const getRowIcon = (row: SponsorLevelTransaction) => (
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

  const columns: Column<SponsorLevelTransaction>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-blue-400 px-2 py-1 rounded-full font-mono font-medium">
        {r.refId}
        </span>
      ),
    },
    {
      key: "wallet",
      label: "Wallet",
      render: (r) => (
        <WalletCell
          address={r.fullWallet}
          displayAddress={formattedWalletAddress(r.fullWallet)}
          explorerUrl={
            r.fullWallet && r.fullWallet.startsWith("0x")
              ? `https://bscscan.com/address/${r.fullWallet}`
              : undefined
          }
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
            r.type === "recycle"
              ? "text-green-400 font-semibold"
              : "text-green-400 font-semibold"
          }
        >
          {r.amount}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="w-full text-white flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#0f9b6e]" />
        <span className="text-gray-400 text-sm">
          Loading Sponsor Cycle Structure...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <LevelPageLayout
        breadcrumb={[
          { label: `ID ${ownIdClean}` },
          { label: program },
          { label: `Cycle ${level}` },
        ]}
        title={`Package`}
        uplineId={uplineDisplay}
        isLoading={isNavigating}
        program={program}
        cycle={{
          current: activeCycle,
          totalCycles: totalCyclesCount,
          cycleLabel: `Cycle: ${activeCycle}`,
          hasPrev: activeCycle > 1,
          hasNext: activeCycle < totalCyclesCount,
          onPrev: () => setCycle((c) => Math.max(1, c - 1)),
          onNext: () => setCycle((c) => Math.min(totalCyclesCount, c + 1)),
          onSelect: setCycle,
        }}
      >
        <SponsorLevelSummaryCard
          level={levelNum}
          cycleNum={activeCycle}
          id={ownIdClean}
          coinCount={coinValue}
          partnersCount={detail?.partnersCount || 0}
          cyclesCount={detail?.cyclesCount || 0}
          totalRevenue={`${detail?.totalRevenue || "0"} USDT`}
          partners={partnerSlots}
        />
      </LevelPageLayout>
      <div className="my-8">
        <DataTable<SponsorLevelTransaction>
          columns={columns}
          data={detail?.transactions || []}
          getRowIcon={getRowIcon}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default PreviewSponsorMagicPackagePage;
