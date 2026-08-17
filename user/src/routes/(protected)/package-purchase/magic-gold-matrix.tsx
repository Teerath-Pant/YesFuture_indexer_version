// src/routes/(protected)/package-purchase/magic-gold-matrix.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import DataTable, { type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
// import Modal from "@/components/modal";
import { type PackageCardData } from "@/components/package-card-selector";
import PackagePurchaseForm from "@/components/package-purchase-form";
// import PackageSelectTrigger from "@/components/package-select-trigger";
// import PackageWheelSelector from "@/components/package-wheel-selector";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/lib/use-wallet";
import { 
  fetchMatrixPackageAndIdWithMax,
  fetchMatrixOnlyHistory,
  buyMatrixPackage,
  fetchMatrixCycleAndHoldStatus,
  
  fetchMatrixTreeInfo
} from "@/lib/auth-api";
import { toast } from "sonner";

export const Route = createFileRoute("/(protected)/package-purchase/magic-gold-matrix")({
  component: MatrixMagicPage,
});

// Define the interface locally or import from auth-api
interface PurchasedPackageRow {
  index: number;
  package: string;
  amount: string;
  date: string;
  track?: string;
}

// Matrix package prices (50% of total package price)
const PACKAGES: PackageCardData[] = [
  { id: "1", label: "Package 1", amount: "37.5 USDT", color: "from-[#212123] to-[#2b4bcf]" },
  { id: "2", label: "Package 2", amount: "75 USDT", color: "from-[#0f9b6e] to-[#0c7a56]" },
  { id: "3", label: "Package 3", amount: "150 USDT", color: "from-[#c9820f] to-[#9c650a]" },
  { id: "4", label: "Package 4", amount: "300 USDT", color: "from-[#7c3aed] to-[#4c1d95]" },
  { id: "5", label: "Package 5", amount: "600 USDT", color: "from-[#0ea5b7] to-[#0a7a88]" },
  { id: "6", label: "Package 6", amount: "1200 USDT", color: "from-[#4169FF] to-[#2b4bcf]" },
  { id: "7", label: "Package 7", amount: "2400 USDT", color: "from-[#0f9b6e] to-[#0c7a56]" },
  { id: "8", label: "Package 8", amount: "4800 USDT", color: "from-[#c9820f] to-[#9c650a]" },
  { id: "9", label: "Package 9", amount: "9600 USDT", color: "from-[#7c3aed] to-[#4c1d95]" },
];

function MatrixMagicPage() {
  const { address } = useWallet();
  const [currentPkg, setCurrentPkg] = useState<number>(0);
  // const [maxPkg, setMaxPkg] = useState<number>(0);
  const [userId, setUserId] = useState<string>("...");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<PurchasedPackageRow[]>([]);
  // const [matrixStatus, setMatrixStatus] = useState<any>(null);
  const [treeInfo, setTreeInfo] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("idle");
  // const [showTreeInfo, setShowTreeInfo] = useState(false);

  const nextPkg = currentPkg === 9 ? 1 : currentPkg + 1;

  const loadData = async () => {
    if (!address) return;
    
    setIsLoadingData(true);
    try {
      const [pkgData, history, tree] = await Promise.all([
        fetchMatrixPackageAndIdWithMax(address),
        fetchMatrixOnlyHistory(address),
        fetchMatrixCycleAndHoldStatus(address, currentPkg || 1),
        fetchMatrixTreeInfo(address, currentPkg || 1)
      ]);
      
      let activePkg = pkgData?.pkgId;
      if (!activePkg || activePkg === 0) {
        activePkg = 1; 
      }
      setCurrentPkg(activePkg);
      // setMaxPkg(pkgData?.maxPkg || activePkg);
      setUserId(pkgData?.numericId !== "..." ? pkgData.numericId : "Syncing...");
      
      // if (status) {
      //   setMatrixStatus(status);
      // }
      
      if (tree) {
        setTreeInfo(tree);
      }
      
      // ✅ FIXED: Properly type the history data
      let displayHistory: PurchasedPackageRow[] = [...(history || [])];
      
      const hasPackage1 = displayHistory.some(item => 
        item.package === "Package 1" || 
        item.amount.includes("37.5")
      );
      
      if (activePkg >= 1 && !hasPackage1) {
        displayHistory.push({
          index: 1,
          package: "Package 1",
          amount: "37.5 USDT",
          date: "Auto-Activated",
          track: "MATRIX"
        });
      }
      
      displayHistory.sort((a, b) => {
        if (a.date === "Auto-Activated") return -1;
        if (b.date === "Auto-Activated") return 1;
        return b.index - a.index;
      });
      
      setHistoryData(displayHistory);
      
      const next = activePkg === 9 ? 1 : activePkg + 1;
      setSelectedPackageId(next.toString());
      
    } catch (error) {
      console.error("Error loading matrix magic data:", error);
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  // const handlePackageSelect = (id: string) => {
  //   const clickedId = Number(id);
  //   if (clickedId === nextPkg) {
  //     setSelectedPackageId(id);
  //     setIsSelectorOpen(false);
  //   } else if (clickedId <= currentPkg) {
  //     alert("Already purchased this package!");
  //   } else {
  //     alert(`Please purchase Package ${nextPkg} first!`);
  //   }
  // };

  const selectedPackage = PACKAGES.find((p) => p.id === selectedPackageId);

  const handlePurchase = async () => {
    if (!selectedPackage || !address) return;
    
    setIsSubmitting(true);
    setTxStatus("approving");
    
    try {
      // ✅ FIXED: Added type for status parameter
      await buyMatrixPackage(Number(selectedPackage.id), selectedPackage.amount, (status: string) => {
        setTxStatus(status);
      });
      
      toast.message("Matrix Package successfully purchased!");
      
      const newCurrentPkg = Number(selectedPackage.id);
      setCurrentPkg(newCurrentPkg);
      const newNext = newCurrentPkg === 9 ? 1 : newCurrentPkg + 1;
      setSelectedPackageId(newNext.toString());
      
      setTimeout(() => {
        loadData();
      }, 1500);
      
    } catch (error: any) {
      console.error("Purchase error details:", error);
      if (error?.code === 4001 || error?.code === "ACTION_REJECTED" || error?.message?.includes("user rejected action")) {
        toast.message("Transaction cancelled by user.");
      } else {
        toast.error("Transaction failed. Please check your balance and try again.");
      }
    } finally {
      setIsSubmitting(false);
      setTxStatus("idle");
      setIsSelectorOpen(false);
    }
  };

  const columns: Column<PurchasedPackageRow>[] = [
    { key: "index", label: "Index" },
    {
      key: "package",
      label: "Package",
      render: (r) => (
        <span className={`text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1 rounded-full text-xs font-medium border border-[#3b82f6]/20 ${r.date === "Auto-Activated" ? "opacity-60" : ""}`}>
          {r.package}
          {r.date === "Auto-Activated" && " 🔄"}
        </span>
      ),
    },
    { 
      key: "amount", 
      label: "Amount",
      render: (r) => (
        <span className={r.date === "Auto-Activated" ? "text-gray-500" : "text-white"}>
          {r.amount}
        </span>
      )
    },
    { 
      key: "date", 
      label: "Date",
      render: (r) => (
        <span className={r.date === "Auto-Activated" ? "text-yellow-500" : "text-gray-400"}>
          {r.date}
        </span>
      )
    },
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

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageHeader title="Package Purchase" id={`ID ${userId}`} />
            <div className="mt-2 inline-block bg-[#7c3aed] text-white px-4 py-1.5 rounded-md font-semibold text-sm">
              Magic Gold Matrix
            </div>
          </div>
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadData();
            }}
            disabled={isRefreshing}
            className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>
      {/* {treeInfo && (
        <div className="mb-6">
          <button
            onClick={() => setShowTreeInfo(!showTreeInfo)}
            className="text-white bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {showTreeInfo ? "▼ Hide" : "▶ Show"} Matrix Tree Structure
          </button>
          
          {showTreeInfo && (
            <div className="mt-4 bg-[#1a1a2e] rounded-xl p-4 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Parent Node</h4>
                  <p className="text-white font-mono text-sm">
                    {treeInfo.parent === "0x0000000000000000000000000000000000000000" 
                      ? "🌳 Root Node" 
                      : `${treeInfo.parent.slice(0, 6)}...${treeInfo.parent.slice(-4)}`}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Direct Children ({treeInfo.children?.length || 0}/2)</h4>
                  {treeInfo.children && treeInfo.children.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {treeInfo.children.map((child: string, index: number) => (
                        <span key={index} className="text-white bg-gray-800 px-3 py-1 rounded-full text-xs font-mono">
                          {child.slice(0, 6)}...{child.slice(-4)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No children yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )} */}

      <div className="mb-6">
        {/* <h3 className="text-white text-base font-bold mb-3">
          Choose a package
        </h3>

        <div className="w-full">
          <PackageSelectTrigger
            selectedPackage={selectedPackage}
            onClick={() => setIsSelectorOpen(true)}
          />
        </div> */}

        <div className="mt-6 w-full">
          <PackagePurchaseForm
            walletId={address || "Connect Wallet"}
            selectedPackage={selectedPackage}
            onPurchase={handlePurchase}
            isSubmitting={isSubmitting}
          />
          {txStatus === "approving" && (
            <p className="text-center text-xs mt-2 text-yellow-500 animate-pulse">
              ⏳ Approving USDT...
            </p>
          )}
          {txStatus === "purchasing" && (
            <p className="text-center text-xs mt-2 text-blue-500 animate-pulse">
              ⏳ Confirming Purchase...
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-white text-base font-bold mb-3">
          Matrix Package Purchase History
        </h3>
        <DataTable<PurchasedPackageRow>
          columns={columns}
          data={historyData}
          getRowKey={(row) => `${row.index}-${row.package}-${row.date}`}
          pageSize={10}
        />
      </div>

      {/* <Modal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Choose a package"
      >
        <PackageWheelSelector
          packages={PACKAGES}
          selectedId={selectedPackageId}
          onSelect={handlePackageSelect}
        />
      </Modal> */}
    </PageLayout>
  );
}

export default MatrixMagicPage;