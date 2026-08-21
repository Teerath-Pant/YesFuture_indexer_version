import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/page-header";
import DataTable, { type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
import PackageCardSelector, {
  type PackageCardData,
} from "@/components/package-card-selector";
import PackagePurchaseForm from "@/components/package-purchase-form";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import {
  PurchaseOverlay,
  type PurchaseStep,
  type PurchaseContext,
} from "@/components/purchase-overlay";
import { useWallet } from "@/lib/use-wallet";
import {
  fetchMatrixPackageAndIdWithMax,
  fetchLevelPackageAndIdWithMax,
  fetchSponsorPackageAndIdWithMax,
  buyMatrixPackage,
  buyLevelPackage,
  buySponsorPackage,
  fetchPackageAndId,
  fetchPurchaseHistory,
} from "@/lib/auth-api";
import { toast } from "sonner";
import {
  LEVEL_PACKAGES,
  MATRIX_PACKAGES,
  SPONSOR_PACKAGES,
} from "@/constants/programs";

interface PurchasedPackageRow {
  index: number;
  package: string;
  amount: string;
  date: string;
}

interface ProgramStatus {
  key: "matrix" | "level" | "sponsor";
  label: string;
  currentPkg: number;
  isPurchasedForSelected: boolean;
  amount: string;
}

export const Route = createFileRoute("/(protected)/package-purchase/")({
  component: PackagePurchasePage,
});

const PACKAGES: PackageCardData[] = [
  {
    id: "1",
    label: "Package 1",
    amount: "75 USDT",
    color: "from-[#212123] to-[#2b4bcf]",
  },
  {
    id: "2",
    label: "Package 2",
    amount: "150 USDT",
    color: "from-[#0f9b6e] to-[#0c7a56]",
  },
  {
    id: "3",
    label: "Package 3",
    amount: "300 USDT",
    color: "from-[#c9820f] to-[#9c650a]",
  },
  {
    id: "4",
    label: "Package 4",
    amount: "600 USDT",
    color: "from-[#7c3aed] to-[#4c1d95]",
  },
  {
    id: "5",
    label: "Package 5",
    amount: "1200 USDT",
    color: "from-[#0ea5b7] to-[#0a7a88]",
  },
  {
    id: "6",
    label: "Package 6",
    amount: "2400 USDT",
    color: "from-[#4169FF] to-[#2b4bcf]",
  },
  {
    id: "7",
    label: "Package 7",
    amount: "4800 USDT",
    color: "from-[#0f9b6e] to-[#0c7a56]",
  },
  {
    id: "8",
    label: "Package 8",
    amount: "9600 USDT",
    color: "from-[#c9820f] to-[#9c650a]",
  },
  {
    id: "9",
    label: "Package 9",
    amount: "19200 USDT",
    color: "from-[#7c3aed] to-[#4c1d95]",
  },
];

const HIDE_LOCKED_PACKAGES = false;

const BUY_FN_MAP = {
  matrix: buyMatrixPackage,
  level: buyLevelPackage,
  sponsor: buySponsorPackage,
} as const;

const AMOUNT_MAP = {
  matrix: MATRIX_PACKAGES,
  level: LEVEL_PACKAGES,
  sponsor: SPONSOR_PACKAGES,
} as const;

export default function PackagePurchasePage() {
  const { address } = useWallet();
  const [currentPkg, setCurrentPkg] = useState<number>(0);
  const [userId, setUserId] = useState<string>("...");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [historyData, setHistoryData] = useState<PurchasedPackageRow[]>([]);
  const [programStatuses, setProgramStatuses] = useState<ProgramStatus[]>([]);

  const [selectedPackageId, setSelectedPackageId] = useState<
    string | undefined
  >();
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [txStatus, setTxStatus] = useState<string>("idle");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep | null>(null);
  const [purchaseContext, setPurchaseContext] =
    useState<PurchaseContext | null>(null);

  const nextPkg = currentPkg === 9 ? 1 : currentPkg + 1;

  // ── Central loader, reused on mount + after purchase ──────────────────────
  const loadAllData = useCallback(async () => {
    if (!address) return;
    try {
      const [pkgData, history, matrixData, levelData, sponsorData] =
        await Promise.all([
          fetchPackageAndId(address),
          fetchPurchaseHistory(address),
          fetchMatrixPackageAndIdWithMax(address),
          fetchLevelPackageAndIdWithMax(address),
          fetchSponsorPackageAndIdWithMax(address),
        ]);
      setCurrentPkg(pkgData.pkgId);
      setUserId(pkgData.stringId);
      setHistoryData(history);

      const next = pkgData.pkgId === 9 ? 1 : pkgData.pkgId + 1;
      setSelectedPackageId(next.toString());

      const selId = next;
      const ownNext = (pkgId: number) => Math.min((pkgId ?? 0) + 1, 9);

      setProgramStatuses([
        {
          key: "matrix",
          label: "Magic Gold Matrix",
          currentPkg: matrixData?.pkgId ?? 0,
          isPurchasedForSelected: (matrixData?.pkgId ?? 0) >= selId,
          amount:
            AMOUNT_MAP.matrix.find(
              (x) => x.id === String(ownNext(matrixData?.pkgId ?? 0)),
            )?.amount ?? "",
        },
        {
          key: "level",
          label: "Magic Level",
          currentPkg: levelData?.pkgId ?? 0,
          isPurchasedForSelected: (levelData?.pkgId ?? 0) >= selId,
          amount:
            AMOUNT_MAP.level.find(
              (x) => x.id === String(ownNext(levelData?.pkgId ?? 0)),
            )?.amount ?? "",
        },
        {
          key: "sponsor",
          label: "Sponsor Magic",
          currentPkg: sponsorData?.pkgId ?? 0,
          isPurchasedForSelected: (sponsorData?.pkgId ?? 0) >= selId,
          amount:
            AMOUNT_MAP.sponsor.find(
              (x) => x.id === String(ownNext(sponsorData?.pkgId ?? 0)),
            )?.amount ?? "",
        },
      ]);
    } catch (err) {
      console.error("Error loading package purchase data:", err);
      toast.error("Failed to load package data.");
    } finally {
      setIsLoadingData(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      setIsLoadingData(true);
      loadAllData();
    }
  }, [address, loadAllData]);

  // ── Package card selection ────────────────────────────────────────────────
  const handlePackageSelect = (id: string) => {
    const clickedId = Number(id);
    if (clickedId === nextPkg) {
      setSelectedPackageId(id);
      setProgramStatuses((prev) =>
        prev.map((p) => ({
          ...p,
          isPurchasedForSelected: p.currentPkg >= clickedId,
        })),
      );
    } else if (clickedId <= currentPkg) {
      toast.message("Already purchased this package!");
    } else {
      toast.message(`Please purchase Package ${nextPkg}!`);
    }
  };

  const selectedPackage = PACKAGES.find((p) => p.id === selectedPackageId);

  // ── Purchase: sirf pending programs ke liye buy call, purchased ko skip ──
  const pendingPrograms = programStatuses.filter(
    (p) => !p.isPurchasedForSelected,
  );
  const handlePurchaseAllPending = async () => {
    if (!selectedPackage || !address) return;

    if (pendingPrograms.length === 0) {
      toast.message("All types for this package have already been purchased!");
      return;
    }

    setIsSubmitting(true);

    try {
      const targetId = Number(selectedPackage.id);

      type PlannedStep = {
        program: (typeof pendingPrograms)[number];
        tier: number;
      };
      const plannedSteps: PlannedStep[] = [];
      for (const p of pendingPrograms) {
        for (let tier = p.currentPkg + 1; tier <= targetId; tier++) {
          if (AMOUNT_MAP[p.key].find((x) => x.id === String(tier))) {
            plannedSteps.push({ program: p, tier });
          }
        }
      }

      let stepIndex = 0;
      for (const { program: p, tier } of plannedSteps) {
        stepIndex += 1;
        const splitPkg = AMOUNT_MAP[p.key].find((x) => x.id === String(tier));
        if (!splitPkg) {
          console.error(`No split price found for ${p.key}, package ${tier}`);
          continue;
        }

        setPurchaseContext({
          programLabel: p.label,
          tier,
          index: stepIndex,
          total: plannedSteps.length,
        });

        await BUY_FN_MAP[p.key](
          tier,
          splitPkg.amount, // ✅ sahi — us program ka apna split amount
          (status: string) => setPurchaseStep(status as PurchaseStep),
        );
      }

      setPurchaseStep("success");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success(
        `Purchased: ${pendingPrograms.map((p) => p.label).join(", ")}`,
      );

      // Sab kuch re-fetch — rows automatically Pending → Purchased flip ho jayenge
      await loadAllData();
    } catch (error: any) {
      console.error("Purchase error details:", error);
      if (
        error?.code === 4001 ||
        error?.code === "ACTION_REJECTED" ||
        error?.message?.includes("user rejected action")
      ) {
        toast.message("Transaction cancelled by user.");
      } else {
        toast.error(
          "Transaction failed. Please check your balance and try again.",
        );
      }
      // Error ke baad bhi ek reload kar do taaki state sync rahe
      await loadAllData();
    } finally {
      setIsSubmitting(false);
      setPurchaseStep(null);
      setPurchaseContext(null);
    }
  };

  const columns: Column<PurchasedPackageRow>[] = [
    // { key: "index", label: "Index" },
    {
      key: "package",
      label: "Package",
      render: (r) => (
        <span className="text-blue-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
          {r.package}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <span className="text-green-400 font-semibold">{r.amount}</span>
      ),
    },
    { key: "date", label: "Date" },
  ];

  if (isLoadingData) {
    return (
      <PageLayout>
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  const purchaseButtonLabel = isSubmitting
    ? "Processing..."
    : pendingPrograms.length === 0
      ? "Already Purchased"
      : `Purchase Package`;
  //   : `Purchase (${pendingPrograms.map((p) => p.label).join(" + ")})`;

  // console.log(historyData)

  return (
    <PageLayout>
      <PageHeader title="Package Purchase" id={`ID ${userId}`} />

      <div className="rounded-2xl  mb-4">
        <h3 className="text-white text-base font-bold mb-1">
          Packages Overview
          {/* <span className="text-xs text-gray-400 font-normal ml-2">
            (Current: Package {currentPkg})
          </span> */}
        </h3>

        <div className="opacity-90">
          <PackageCardSelector
            packages={PACKAGES}
            selectedId={selectedPackageId}
            onSelect={handlePackageSelect}
            currentPkg={currentPkg}
            hideLockedPackages={HIDE_LOCKED_PACKAGES}
          />
        </div>

        {/* ── 3-row program status list ─────────────────────────────────── */}
        <div className="mt-5 space-y-2">
          {programStatuses.map((p) => (
            <div
              key={p.key}
              className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl"
            >
              <span className="text-white text-sm font-medium">{p.label}</span>
              {p.isPurchasedForSelected ? (
                <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                  {p.amount && (
                    <span>$ {p.amount.replace(/USDT/i, "").trim()}</span>
                  )}
                  <CheckCircle2 size={14} /> Purchased
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold">
                  {p.amount && (
                    <span>$ {p.amount.replace(/USDT/i, "").trim()}</span>
                  )}
                  <Clock size={14} /> Pending
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 w-full">
          <PurchaseOverlay step={purchaseStep} context={purchaseContext} />
          <PackagePurchaseForm
            walletId={address || "Connect Wallet"}
            selectedPackage={selectedPackage}
            onPurchase={handlePurchaseAllPending}
            isSubmitting={isSubmitting}
            purchaseLabel={purchaseButtonLabel}
            purchaseDisabled={isSubmitting || pendingPrograms.length === 0}
          />
        </div>
      </div>

      <DataTable<PurchasedPackageRow>
        columns={columns}
        data={historyData}
        getRowKey={(row) => row.index}
      />
    </PageLayout>
  );
}
