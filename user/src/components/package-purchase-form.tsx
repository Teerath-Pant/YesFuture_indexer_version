// import { Wallet } from "lucide-react";
// import { type PackageCardData } from "./package-card-selector";

//    interface PackagePurchaseFormProps {
//      walletId: string;
//      selectedPackage?: PackageCardData;
//      onPurchase: () => void;
//      isSubmitting: boolean;
//      purchaseLabel?: string;      // ← naya
//      purchaseDisabled?: boolean;  // ← naya
//    }

// export default function PackagePurchaseForm({
//   walletId,
//   selectedPackage,
//   onPurchase,
//   isSubmitting = false,
// }: PackagePurchaseFormProps) {
//   return (
//     <div className="space-y-4">
//       {/* Wallet ID (read-only display) */}
//       <div className="flex flex-col md:flex-row justify-between gap-4">
//         <div>
//           <label className="text-gray-400 text-sm font-medium mb-2 block">
//             Wallet
//           </label>
//           <div className="flex items-center gap-2 bg-[#0e0e15] rounded-xl px-4 py-3 text-white text-sm">
//             <Wallet size={16} className="text-gray-500 shrink-0" />
//             <span className="truncate">{walletId}</span>
//           </div>
//         </div>

//         {/* Selected package summary */}
//         <div>
//           <label className="text-gray-400 md:text-end text-sm font-medium mb-2 block">
//             Selected package
//           </label>
//           <div className="bg-[#0e0e15] rounded-xl px-4 py-3 text-white text-sm">
//             {selectedPackage
//               ? `${selectedPackage.label} — ${selectedPackage.amount}`
//               : "No package selected"}
//           </div>
//         </div>
//       </div>

//       {/* Purchase button */}
//       <button
//         type="button"
//         onClick={onPurchase}
//         disabled={isSubmitting || !selectedPackage}
//         className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
//       >
//         {isSubmitting ? "Purchasing..." : "Purchase package"}
//       </button>
//     </div>
//   );
// }

import { Wallet } from "lucide-react";
import { type PackageCardData } from "./package-card-selector";

interface PackagePurchaseFormProps {
  walletId: string;
  selectedPackage?: PackageCardData;
  onPurchase: () => void;
  isSubmitting: boolean;
  purchaseLabel?: string;
  purchaseDisabled?: boolean;
}

export default function PackagePurchaseForm({
  walletId,
  selectedPackage,
  onPurchase,
  isSubmitting = false,
  purchaseLabel,
  purchaseDisabled,
}: PackagePurchaseFormProps) {
  const isDisabled = purchaseDisabled ?? (isSubmitting || !selectedPackage);
  const label = purchaseLabel ?? (isSubmitting ? "Purchasing..." : "Purchase package");

  return (
    <div className="space-y-4">
      {/* Wallet ID (read-only display) */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <label className="text-gray-400 text-sm font-medium mb-2 block">
            Wallet
          </label>
          <div className="flex items-center gap-2 bg-[#0e0e15] rounded-xl px-4 py-3 text-white text-sm">
            <Wallet size={16} className="text-gray-500 shrink-0" />
            <span className="truncate">{walletId}</span>
          </div>
        </div>

        {/* Selected package summary */}
        <div>
          <label className="text-gray-400 md:text-end text-sm font-medium mb-2 block">
            Selected package
          </label>
          <div className="bg-[#0e0e15] rounded-xl px-4 py-3 text-white text-sm">
            {selectedPackage
              ? `${selectedPackage.label} — ${selectedPackage.amount}`
              : "No package selected"}
          </div>
        </div>
      </div>

      {/* Purchase button */}
      <button
        type="button"
        onClick={onPurchase}
        disabled={isDisabled}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
      >
        {label}
      </button>
    </div>
  );
}