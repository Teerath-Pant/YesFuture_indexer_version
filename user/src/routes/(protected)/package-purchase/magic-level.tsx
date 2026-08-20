// src/routes/(protected)/package-purchase/magic-level.tsx

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/lib/use-wallet";
import { 
  fetchLevelPackageAndIdWithMax,
  fetchLevelOnlyHistory,
  buyLevelPackage,
  fetchUserLevelIncome,
  fetchUserTotalLevelProfit,
  fetchLevelIncomeHistory,
  type PurchasedPackageRow
} from "@/lib/auth-api";
import { toast } from "sonner";

// Define the route
export const Route = createFileRoute("/(protected)/package-purchase/magic-level")({
  beforeLoad:()=>{
      throw redirect({
        to:"/package-purchase"
      })
    },
  component: MagicLevelPage,
});

// Level package prices (33.3% of total package price)
const LEVEL_PACKAGES = [
  { id: 1, label: "Package 1", amount: "24.975 USDT" },
  { id: 2, label: "Package 2", amount: "49.95 USDT" },
  { id: 3, label: "Package 3", amount: "99.90 USDT" },
  { id: 4, label: "Package 4", amount: "199.80 USDT" },
  { id: 5, label: "Package 5", amount: "399.60 USDT" },
  { id: 6, label: "Package 6", amount: "799.20 USDT" },
  { id: 7, label: "Package 7", amount: "1598.40 USDT" },
  { id: 8, label: "Package 8", amount: "3196.80 USDT" },
  { id: 9, label: "Package 9", amount: "6393.60 USDT" },
];

function MagicLevelPage() {
  const { address } = useWallet();
  const [userId, setUserId] = useState<string>("...");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<PurchasedPackageRow[]>([]);
  const [levelIncomes, setLevelIncomes] = useState<{ [key: number]: string }>({});
  const [selectedPackage, setSelectedPackage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("idle");
  const [showLevelIncome, setShowLevelIncome] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);

  const loadData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [pkgData, history, levelIncome, _totalProfitRaw] = await Promise.all([
        fetchLevelPackageAndIdWithMax(address),
        fetchLevelOnlyHistory(address),
        fetchUserLevelIncome(address),
        fetchUserTotalLevelProfit(address),
        fetchLevelIncomeHistory(address)
      ]);

      let activePkg = pkgData?.pkgId || 1;
      setUserId(pkgData?.numericId || "...");
      
      if (levelIncome) {
        setLevelIncomes(levelIncome);
      }
      
      let displayHistory: PurchasedPackageRow[] = [...(history || [])];
      const hasPackage1 = displayHistory.some(item => item.package === "Package 1");
      
      if (activePkg >= 1 && !hasPackage1) {
        displayHistory.push({
          index: 1,
          package: "Package 1",
          amount: "24.75 USDT",
          date: "Auto-Activated",
          track: "LEVEL",
          packageId: 1
        });
      }
      
      displayHistory.sort((a, b) => {
        if (a.date === "Auto-Activated") return -1;
        if (b.date === "Auto-Activated") return 1;
        return b.index - a.index;
      });
      setHistoryData(displayHistory);
      
      const nextPkg = activePkg >= 9 ? 1 : activePkg + 1;
      setSelectedPackage(nextPkg);
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const handlePurchase = async () => {
    if (!address) return;
    
    setIsSubmitting(true);
    setTxStatus("approving");
    
    try {
      const selectedPkg = LEVEL_PACKAGES.find(p => p.id === selectedPackage);
      if (!selectedPkg) return;
      
      await buyLevelPackage(selectedPackage, selectedPkg.amount, (status: string) => {
        setTxStatus(status);
      });
      
      toast.message(`Package ${selectedPackage} successfully purchased!`);
      await loadData();
      
    } catch (error: any) {
      console.error("Purchase error:", error);
      if (error?.code === 4001 || error?.message?.includes("user rejected")) {
        toast.message("Transaction cancelled by user.");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setTxStatus("idle");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Package Purchase</h1>
            <p className="text-gray-400">ID: {userId}</p>
            <div className="mt-2 inline-block bg-[#2b4bcf] text-white px-4 py-1.5 rounded-md font-semibold text-sm">
              Level Magic
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

      {/* Level Income Breakdown */}
      {Object.keys(levelIncomes).length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowLevelIncome(!showLevelIncome)}
            className="text-white bg-[#2b4bcf]/20 hover:bg-[#2b4bcf]/30 px-4 py-2 rounded-lg text-sm"
          >
            {showLevelIncome ? "▼ Hide" : "▶ Show"} Level Income
          </button>
          {showLevelIncome && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map(level => (
                <div key={level} className="bg-[#1a1a2e] p-3 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs">Level {level}</p>
                  <p className="text-white font-semibold">{levelIncomes[level] || "0"} USDT</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Package Selection */}
      <div className="mb-6">
        <h3 className="text-white text-base font-bold mb-3">
          Choose a package
        </h3>

        <div className="w-full">
          {/* Package Select Trigger */}
          <div 
            className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-[#2b4bcf] transition-colors"
            onClick={() => setShowPackageSelector(!showPackageSelector)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selected Package</p>
                <p className="text-white font-semibold text-lg">
                  {LEVEL_PACKAGES.find(p => p.id === selectedPackage)?.label || "Select Package"}
                </p>
                <p className="text-[#2b4bcf] text-sm">
                  {LEVEL_PACKAGES.find(p => p.id === selectedPackage)?.amount || ""}
                </p>
              </div>
              <div className="text-gray-400">
                {showPackageSelector ? "▲" : "▼"}
              </div>
            </div>
          </div>

          {/* Package Selector Dropdown */}
          {showPackageSelector && (
            <div className="mt-2 bg-[#1a1a2e] rounded-xl border border-gray-700 overflow-hidden">
              {LEVEL_PACKAGES.map((pkg) => {
                const isPurchased = historyData.some(item => item.package === `Package ${pkg.id}`);
                
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setShowPackageSelector(false);
                    }}
                    className={`px-4 py-3 flex items-center justify-between border-b border-gray-700 last:border-b-0 cursor-pointer transition-colors hover:bg-[#2b4bcf]/10 ${
                      selectedPackage === pkg.id ? 'bg-[#2b4bcf]/20' : ''
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${selectedPackage === pkg.id ? 'text-[#2b4bcf]' : 'text-white'}`}>
                        {pkg.label}
                        {isPurchased && <span className="text-green-500 text-xs ml-2">✓ Purchased</span>}
                      </p>
                      <p className="text-gray-400 text-sm">{pkg.amount}</p>
                    </div>
                    {selectedPackage === pkg.id && (
                      <div className="text-[#2b4bcf]">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase Form */}
        <div className="mt-6 w-full">
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Wallet</p>
                <p className="text-white font-mono text-sm truncate max-w-[200px]">
                  {address || "Connect Wallet"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Selected package</p>
                <p className="text-white font-semibold">
                  {LEVEL_PACKAGES.find(p => p.id === selectedPackage)?.label || "Package"}
                </p>
                <p className="text-[#2b4bcf] text-sm">
                  {LEVEL_PACKAGES.find(p => p.id === selectedPackage)?.amount || ""}
                </p>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#2b4bcf] text-white hover:bg-[#3b5bef]'
              }`}
            >
              {isSubmitting ? "Processing..." : `Purchase ${LEVEL_PACKAGES.find(p => p.id === selectedPackage)?.label || "Package"}`}
            </button>
            
            {txStatus === "approving" && (
              <p className="text-yellow-500 text-sm mt-2 text-center animate-pulse">
                ⏳ Approving USDT...
              </p>
            )}
            {txStatus === "purchasing" && (
              <p className="text-blue-500 text-sm mt-2 text-center animate-pulse">
                ⏳ Confirming Purchase...
              </p>
            )}
          </div>
        </div>
      </div>

   // Update the purchase history table in magic-level.tsx

{/* Purchase History Table */}
<div className="mb-6">
  <h3 className="text-white text-base font-bold mb-3">
    Level Package Purchase History
  </h3>
  <div className="bg-[#1a1a2e] rounded-xl border border-gray-700 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-800">
        <tr>
          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Index</th>
          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Package</th>
          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Amount</th>
          <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Date</th>
        </tr>
      </thead>
      <tbody>
        {historyData.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center text-gray-500 py-4">No level purchases yet</td>
          </tr>
        ) : (
          historyData.map((row) => {
            // Check if date is "Auto-Activated" or "Pending"
            const isPending = row.date === "Pending" || row.date === "pending";
            const isAutoActivated = row.date === "Auto-Activated";
            
            return (
              <tr key={row.index} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white">{row.index}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isPending 
                      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' 
                      : 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20'
                  }`}>
                    {row.package}
                    {isPending && ' ⏳'}
                    {isAutoActivated && ' ✅'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white">{row.amount}</td>
                <td className="px-4 py-3">
                  {isPending ? (
                    <span className="text-yellow-500 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      Pending
                    </span>
                  ) : isAutoActivated ? (
                    <span className="text-green-500">Auto-Activated</span>
                  ) : (
                    <span className="text-gray-300">{row.date}</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}

export default MagicLevelPage;