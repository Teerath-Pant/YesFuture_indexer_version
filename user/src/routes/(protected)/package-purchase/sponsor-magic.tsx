
// src/routes/(protected)/package-purchase/sponsor-magic.tsx

import { createFileRoute, redirect,  } from "@tanstack/react-router";
// import { useState, useEffect } from "react";
// import { Loader2 } from "lucide-react";
// import { useWallet } from "@/lib/use-wallet";
// import { 
//   fetchSponsorPackageAndIdWithMax,
//   fetchSponsorOnlyHistory,
//   buySponsorPackage,
//   type PurchasedPackageRow
// } from "@/lib/auth-api";
// import { toast } from "sonner";
// import { RootID } from "@/constants/programs";

export const Route = createFileRoute("/(protected)/package-purchase/sponsor-magic")({
  beforeLoad:()=>{
      throw redirect({
        to:"/package-purchase"
      })
    },
  component: ()=> <span>..</span>,
});

// // Sponsor package prices (16.7% of total package price)
// const SPONSOR_PACKAGES = [
//   { id: 1, label: "Package 1", amount: "12.525 USDT" },
//   { id: 2, label: "Package 2", amount: "25.05 USDT" },
//   { id: 3, label: "Package 3", amount: "50.10 USDT" },
//   { id: 4, label: "Package 4", amount: "100.20 USDT" },
//   { id: 5, label: "Package 5", amount: "200.40 USDT" },
//   { id: 6, label: "Package 6", amount: "400.80 USDT" },
//   { id: 7, label: "Package 7", amount: "801.60 USDT" },
//   { id: 8, label: "Package 8", amount: "1603.20 USDT" },
//   { id: 9, label: "Package 9", amount: "3206.40 USDT" },
// ];

// function SponsorMagicPage() {
//   const { address } = useWallet();
//   const [userId, setUserId] = useState<string>("...");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [historyData, setHistoryData] = useState<PurchasedPackageRow[]>([]);
//   const [selectedPackage, setSelectedPackage] = useState<number>(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [txStatus, setTxStatus] = useState<string>("idle");
//   const [showPackageSelector, setShowPackageSelector] = useState(false);
//   // ✅ Track purchased packages manually
//   const [purchasedPackages, setPurchasedPackages] = useState<number[]>([]);

//   const loadData = async () => {
//     if (!address) return;
    
//     setIsLoading(true);
//     try {
//       const [pkgData, history] = await Promise.all([
//         fetchSponsorPackageAndIdWithMax(address),
//         fetchSponsorOnlyHistory(address)
//       ]);

//       let activePkg = pkgData?.pkgId || 1;
//       const cleanStrId = (pkgData?.stringId || "").replace(/^ID\s*/i, "").trim().toUpperCase();
//       const isRootUser = !!pkgData?.isRoot || pkgData?.numericId === "1" || cleanStrId === RootID || cleanStrId === "1";
      
//       setUserId(pkgData?.numericId || "...");
      
//       // ✅ Build list of purchased packages from history
//       let purchased = history.map(item => {
//         const match = item.package.match(/\d+/);
//         return match ? parseInt(match[0]) : 0;
//       }).filter(id => id > 0);

//       if (isRootUser) {
//         activePkg = 9;
//         purchased = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//       } else if (activePkg >= 1 && !purchased.includes(1)) {
//         purchased.push(1);
//       }
      
//       setPurchasedPackages(purchased);
//       // console.log("📦 Purchased packages:", purchased);
      
//       let displayHistory = [...(history || [])];
//       const hasPackage1 = displayHistory.some(item => item.package === "Package 1");
      
//       if (activePkg >= 1 && !hasPackage1) {
//         displayHistory.push({
//           index: 1,
//           package: "Package 1",
//           amount: "12.525 USDT",
//           date: "Auto-Activated",
//           track: "SPONSOR"
//         });
//       }
      
//       displayHistory.sort((a, b) => {
//         if (a.date === "Auto-Activated") return -1;
//         if (b.date === "Auto-Activated") return 1;
//         return b.index - a.index;
//       });
//       setHistoryData(displayHistory);
      
//       // ✅ Calculate next package based on purchased packages
//       let nextPkg = 1;
//       for (let i = 1; i <= 9; i++) {
//         if (!purchased.includes(i)) {
//           nextPkg = i;
//           break;
//         }
//       }
//       // If all packages purchased, cycle back to 1
//       if (purchased.length >= 9) {
//         nextPkg = 1;
//       }
      
//       // console.log("🎯 Next package should be:", nextPkg);
//       setSelectedPackage(nextPkg);
      
//     } catch (error) {
//       console.error("Error loading sponsor magic data:", error);
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (address) {
//       loadData();
//     }
//   }, [address]);

//   const handlePurchase = async () => {
//     if (!address) return;
    
//     const currentSelectedPkg = selectedPackage;
//     // console.log("🛒 Purchasing package:", currentSelectedPkg);
    
//     setIsSubmitting(true);
//     setTxStatus("approving");
    
//     try {
//       const selectedPkg = SPONSOR_PACKAGES.find(p => p.id === currentSelectedPkg);
//       if (!selectedPkg) return;
      
//       await buySponsorPackage(currentSelectedPkg, selectedPkg.amount, (status: string) => {
//         setTxStatus(status);
//       });
      
//       toast.message(`Sponsor Package ${currentSelectedPkg} successfully purchased!`);
      
//       // ✅ Update purchased packages list
//       setPurchasedPackages(prev => {
//         const updated = [...prev, currentSelectedPkg];
//         // console.log("📦 Updated purchased packages:", updated);
//         return updated;
//       });
      
//       // ✅ Calculate next package from updated list
//       const updatedPurchased = [...purchasedPackages, currentSelectedPkg];
//       let nextPkg = 1;
//       for (let i = 1; i <= 9; i++) {
//         if (!updatedPurchased.includes(i)) {
//           nextPkg = i;
//           break;
//         }
//       }
//       if (updatedPurchased.length >= 9) {
//         nextPkg = 1;
//       }
      
//       // console.log("🎯 Setting next package to:", nextPkg);
//       setSelectedPackage(nextPkg);
      
//       // ✅ Add to history immediately
//       setHistoryData(prev => {
//         const newEntry = {
//           index: prev.length + 1,
//           package: `Package ${currentSelectedPkg}`,
//           amount: selectedPkg.amount,
//           date: new Date().toISOString().replace('T', ' ').substring(0, 19),
//           track: "SPONSOR"
//         };
//         return [newEntry, ...prev];
//       });
      
//       setTimeout(async () => {
//         await loadData();
//       }, 3000);
      
//     } catch (error: any) {
//       console.error("Purchase error:", error);
//       if (error?.code === 4001 || error?.message?.includes("user rejected")) {
//         toast.message("Transaction cancelled by user.");
//       } else {
//         toast.error("Transaction failed. Please try again.");
//       }
//       await loadData();
//     } finally {
//       setIsSubmitting(false);
//       setTxStatus("idle");
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex h-64 w-full items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-[#0f9b6e]" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-white">Package Purchase</h1>
//             <p className="text-gray-400">ID: {userId}</p>
//             <div className="mt-2 inline-block bg-[#0f9b6e] text-white px-4 py-1.5 rounded-md font-semibold text-sm">
//               Sponsor Magic
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               setIsRefreshing(true);
//               loadData();
//             }}
//             disabled={isRefreshing}
//             className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 disabled:opacity-50"
//           >
//             {isRefreshing ? "Refreshing..." : "↻ Refresh"}
//           </button>
//         </div>
//       </div>

//       {/* Package Selection */}
//       <div className="mb-6">
//         <h3 className="text-white text-base font-bold mb-3">
//           Choose a package
//         </h3>

//         <div className="w-full">
//           {/* Package Select Trigger */}
//           <div 
//             className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-[#0f9b6e] transition-colors"
//             onClick={() => setShowPackageSelector(!showPackageSelector)}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-400 text-sm">Selected Package</p>
//                 <p className="text-white font-semibold text-lg">
//                   {SPONSOR_PACKAGES.find(p => p.id === selectedPackage)?.label || "Select Package"}
//                 </p>
//                 <p className="text-[#0f9b6e] text-sm">
//                   {SPONSOR_PACKAGES.find(p => p.id === selectedPackage)?.amount || ""}
//                 </p>
//               </div>
//               <div className="text-gray-400">
//                 {showPackageSelector ? "▲" : "▼"}
//               </div>
//             </div>
//           </div>

//           {/* Package Selector Dropdown */}
//           {showPackageSelector && (
//             <div className="mt-2 bg-[#1a1a2e] rounded-xl border border-gray-700 overflow-hidden">
//               {SPONSOR_PACKAGES.map((pkg) => {
//                 const isPurchased = purchasedPackages.includes(pkg.id);
//                 const isNext = !isPurchased && (pkg.id === Math.min(...SPONSOR_PACKAGES.filter(p => !purchasedPackages.includes(p.id)).map(p => p.id), 9));
//                 const isDisabled = !isNext && !isPurchased;
                
//                 return (
//                   <div
//                     key={pkg.id}
//                     onClick={() => {
//                       if (!isDisabled && isNext) {
//                         setSelectedPackage(pkg.id);
//                         setShowPackageSelector(false);
//                       }
//                     }}
//                     className={`px-4 py-3 flex items-center justify-between border-b border-gray-700 last:border-b-0 cursor-pointer transition-colors ${
//                       isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0f9b6e]/10'
//                     } ${selectedPackage === pkg.id ? 'bg-[#0f9b6e]/20' : ''}`}
//                   >
//                     <div>
//                       <p className={`font-medium ${selectedPackage === pkg.id ? 'text-[#0f9b6e]' : 'text-white'}`}>
//                         {pkg.label}
//                         {isPurchased && <span className="text-green-500 text-xs ml-2">✓ Purchased</span>}
//                         {!isPurchased && isNext && <span className="text-yellow-500 text-xs ml-2">⬅ Available</span>}
//                         {isDisabled && <span className="text-gray-500 text-xs ml-2">🔒 Locked</span>}
//                       </p>
//                       <p className="text-gray-400 text-sm">{pkg.amount}</p>
//                     </div>
//                     {selectedPackage === pkg.id && (
//                       <div className="text-[#0f9b6e]">✓</div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Purchase Form */}
//         <div className="mt-6 w-full">
//           <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-700">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-gray-400 text-sm">Wallet</p>
//                 <p className="text-white font-mono text-sm truncate max-w-[200px]">
//                   {address || "Connect Wallet"}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-gray-400 text-sm">Selected package</p>
//                 <p className="text-white font-semibold">
//                   {SPONSOR_PACKAGES.find(p => p.id === selectedPackage)?.label || "Package"}
//                 </p>
//                 <p className="text-[#0f9b6e] text-sm">
//                   {SPONSOR_PACKAGES.find(p => p.id === selectedPackage)?.amount || ""}
//                 </p>
//               </div>
//             </div>
            
//             <button
//               onClick={handlePurchase}
//               disabled={isSubmitting || purchasedPackages.includes(selectedPackage)}
//               className={`w-full py-3 rounded-lg font-semibold transition-colors ${
//                 isSubmitting || purchasedPackages.includes(selectedPackage)
//                   ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                   : 'bg-[#0f9b6e] text-white hover:bg-[#1aaf7e]'
//               }`}
//             >
//               {isSubmitting ? "Processing..." : 
//                purchasedPackages.includes(selectedPackage) ? "Already Purchased" : 
//                `Purchase ${SPONSOR_PACKAGES.find(p => p.id === selectedPackage)?.label || "Package"}`}
//             </button>
            
//             {purchasedPackages.includes(selectedPackage) && (
//               <p className="text-yellow-500 text-sm mt-2 text-center">
//                 ⚠️ You have already purchased Package {selectedPackage}
//               </p>
//             )}
            
//             {txStatus === "approving" && (
//               <p className="text-yellow-500 text-sm mt-2 text-center animate-pulse">
//                 ⏳ Approving USDT...
//               </p>
//             )}
//             {txStatus === "purchasing" && (
//               <p className="text-blue-500 text-sm mt-2 text-center animate-pulse">
//                 ⏳ Confirming Purchase...
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Purchase History Table */}
//       <div className="mb-6">
//         <h3 className="text-white text-base font-bold mb-3">
//           Sponsor Package Purchase History
//         </h3>
//         <div className="bg-[#1a1a2e] rounded-xl border border-gray-700 overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-800">
//               <tr>
//                 <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Index</th>
//                 <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Package</th>
//                 <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Amount</th>
//                 <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {historyData.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="text-center text-gray-500 py-4">No sponsor purchases yet</td>
//                 </tr>
//               ) : (
//                 historyData.map((row) => (
//                   <tr key={row.index} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
//                     <td className="px-4 py-3 text-white">{row.index}</td>
//                     <td className="px-4 py-3">
//                       <span className="text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1 rounded-full text-xs font-medium border border-[#3b82f6]/20">
//                         {row.package}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-white">{row.amount}</td>
//                     <td className="px-4 py-3 text-gray-400">{row.date}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SponsorMagicPage;