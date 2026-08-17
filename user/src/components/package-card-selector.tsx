// export interface PackageCardData {
//   id: string;
//   label: string; // e.g. "Package 1"
//   amount: string; // e.g. "25 USDT"
//   color: string; // tailwind gradient classes, e.g. "from-pink-500 to-rose-500"
// }

import { Check } from "lucide-react";

// // interface PackageCardSelectorProps {
// //   packages: PackageCardData[];
// //   selectedId?: string;
// //   onSelect: (id: string) => void;
// //   /** vertical list — mobile overlay ke andar ek column me dikhane ke liye */
// //   layout?: "horizontal" | "vertical";
// // }

// interface PackageCardSelectorProps {
//   packages: PackageCardData[];
//   selectedId?: string;
//   onSelect: (id: string) => void;
//   layout?: "horizontal" | "vertical";
//   currentPkg: number; // ← naya
//   hideLockedPackages?: boolean; // ← naya
// }

// export default function PackageCardSelector({
//   packages,
//   selectedId,
//   onSelect,
//   layout = "horizontal",
//   currentPkg, // ← naya
//   hideLockedPackages,
// }: PackageCardSelectorProps) {
//   const nextPkg = currentPkg === 9 ? 1 : currentPkg + 1; // ← naya

//   const visiblePackages = hideLockedPackages // ← naya
//     ? packages.filter((p) => Number(p.id) <= nextPkg)
//     : packages;

//   if (layout === "vertical") {
//     return (
//       <div className="flex flex-col gap-3">
//         {/* {packages.map((pkg) => (
//           <PackageCard
//             key={pkg.id}
//             pkg={pkg}
//             isSelected={pkg.id === selectedId}
//             onSelect={onSelect}
//           />
//         ))} */}
//         {visiblePackages.map((pkg) => {
//           const pkgId = Number(pkg.id);
//           const status =
//             pkgId <= currentPkg
//               ? "purchased"
//               : pkgId === nextPkg
//                 ? "next"
//                 : "locked";
//           return (
//             <PackageCard
//               key={pkg.id}
//               pkg={pkg}
//               status={status} // ← naya, "isSelected" ki jagah
//               onSelect={onSelect}
//               className="shrink-0 w-36"
//             />
//           );
//         })}
//       </div>
//     );
//   }

//   return (
//     <div className="flex gap-4 overflow-x-auto pb-4 pt-6 px-4 scrollbar-thin">
//       {visiblePackages.map((pkg) => {
//         const pkgId = Number(pkg.id);
//         const status =
//           pkgId <= currentPkg
//             ? "purchased"
//             : pkgId === nextPkg
//               ? "next"
//               : "locked";
//         return (
//           <PackageCard
//             key={pkg.id}
//             pkg={pkg}
//             status={status} // ← naya, "isSelected" ki jagah
//             onSelect={onSelect}
//             className="shrink-0 w-36"
//           />
//         );
//       })}
//     </div>
//   );
// }

// // function PackageCard({
// //   pkg,
// //   isSelected,
// //   onSelect,
// //   className = "",
// // }: {
// //   pkg: PackageCardData;
// //   isSelected: boolean;
// //   onSelect: (id: string) => void;
// //   className?: string;
// // }) {
// //   return (
// //     <button
// //       type="button"
// //       onClick={() => onSelect(pkg.id)}
// //       className={`relative rounded-2xl p-5 text-left bg-linear-to-br ${pkg.color} transition-all duration-200 ${
// //         isSelected
// //           ? "-translate-y-3 shadow-2xl ring-2 ring-white scale-105"
// //           : "translate-y-0 shadow-md opacity-90 hover:opacity-100 hover:-translate-y-1"
// //       } ${className}`}
// //     >
// //       <div className="text-white/80 text-xs font-medium mb-2">{pkg.label}</div>
// //       <div className="text-white text-lg font-bold">{pkg.amount}</div>
// //       {isSelected && (
// //         <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
// //           <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-600" fill="none">
// //             <path
// //               d="M5 13l4 4L19 7"
// //               stroke="currentColor"
// //               strokeWidth="3"
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //             />
// //           </svg>
// //         </div>
// //       )}
// //     </button>
// //   );
// // }

// function PackageCard({ pkg, status, isSelected, onSelect }) {
//   const isPurchased = status === "purchased";
//   const isLocked = status === "locked";
//   const clickable = status === "next"; // sirf next hi clickable

//   return (
//     <button
//       type="button"
//       disabled={!clickable}
//       onClick={() => clickable && onSelect(pkg.id)}
//       className={`relative rounded-2xl p-5 text-left bg-linear-to-br ${pkg.color} transition-all
//         ${isPurchased ? "border-2 border-green-500 opacity-100" : ""}
//         ${status === "next" && isSelected ? "-translate-y-3 shadow-2xl ring-2 ring-white scale-105" : ""}
//         ${isLocked ? "opacity-20 pointer-events-none cursor-not-allowed" : ""}
//       `}
//     >
//       <div className="text-white/80 text-xs font-medium mb-2">{pkg.label}</div>
//       <div className="text-white text-lg font-bold">{pkg.amount}</div>

//       {isPurchased && (
//         <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
//           {/* checkmark svg */}
//         </div>
//       )}
//       {isPurchased && (
//         <span className="absolute bottom-1 right-2 text-[10px] text-green-300 font-semibold">
//           Purchased
//         </span>
//       )}
//     </button>
//   );
// }

export interface PackageCardData {
  id: string;
  label: string; // e.g. "Package 1"
  amount: string; // e.g. "25 USDT"
  color: string; // tailwind gradient classes, e.g. "from-pink-500 to-rose-500"
}

type PackageStatus = "purchased" | "next" | "locked";

interface PackageCardSelectorProps {
  packages: PackageCardData[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** vertical list — mobile overlay ke andar ek column me dikhane ke liye */
  layout?: "horizontal" | "vertical";
  currentPkg: number;
  hideLockedPackages?: boolean;
}

function getPackageStatus(
  pkgId: number,
  currentPkg: number,
  nextPkg: number,
): PackageStatus {
  if (pkgId <= currentPkg) return "purchased";
  if (pkgId === nextPkg) return "next";
  return "locked";
}

export default function PackageCardSelector({
  packages,
  selectedId,
  onSelect,
  layout = "horizontal",
  currentPkg,
  hideLockedPackages,
}: PackageCardSelectorProps) {
  const nextPkg = currentPkg === 9 ? 1 : currentPkg + 1;

  const visiblePackages = hideLockedPackages
    ? packages.filter((p) => Number(p.id) <= nextPkg)
    : packages;

  if (layout === "vertical") {
    return (
      <div className="flex flex-col gap-3">
        {visiblePackages.map((pkg) => {
          const pkgId = Number(pkg.id);
          const status = getPackageStatus(pkgId, currentPkg, nextPkg);
          return (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              status={status}
              isSelected={pkg.id === selectedId}
              flat={hideLockedPackages}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-6 px-4 scrollbar-thin">
      {visiblePackages.map((pkg) => {
        const pkgId = Number(pkg.id);
        const status = getPackageStatus(pkgId, currentPkg, nextPkg);
        return (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            status={status}
            isSelected={pkg.id === selectedId}
            onSelect={onSelect}
            flat={hideLockedPackages}
            className="shrink-0 w-36"
          />
        );
      })}
    </div>
  );
}

// function PackageCard({
//   pkg,
//   status,
//   isSelected,
//   onSelect,
//   className = "",
// }: {
//   pkg: PackageCardData;
//   status: PackageStatus;
//   isSelected: boolean;
//   onSelect: (id: string) => void;
//   className?: string;
// }) {
//   const isPurchased = status === "purchased";
//   const isLocked = status === "locked";
//   const clickable = status === "next"; // sirf next hi clickable

//   return (
//     <button
//       type="button"
//       disabled={!clickable}
//       onClick={() => clickable && onSelect(pkg.id)}
//       className={`relative rounded-2xl p-5 text-left bg-linear-to-br ${pkg.color} transition-all duration-200
//         ${
//           isPurchased
//             ? "border-2 border-green-500 opacity-100"
//             : status === "next"
//               ? isSelected
//                 ? "-translate-y-3 shadow-2xl ring-2 ring-white scale-105"
//                 : "translate-y-0 shadow-md opacity-90 hover:opacity-100 hover:-translate-y-1"
//               : ""
//         }
//         ${isLocked ? "opacity-20 pointer-events-none cursor-not-allowed" : ""}
//         ${className}
//       `}
//     >
//       <div className="text-white/80 text-xs font-medium mb-2">{pkg.label}</div>
//       <div className="text-white text-lg font-bold">{pkg.amount}</div>

//       {isPurchased && (
//         <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
//           <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none">
//             <path
//               d="M5 13l4 4L19 7"
//               stroke="currentColor"
//               strokeWidth="3"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </div>
//       )}
//       {isPurchased && (
//         <span className="absolute bottom-1 right-2 text-[10px] text-green-300 font-semibold">
//           Purchased
//         </span>
//       )}
//     </button>
//   );
// }

function PackageCard({
  pkg,
  status,
  isSelected,
  onSelect,
  flat = false,
  className = "",
}: {
  pkg: PackageCardData;
  status: PackageStatus;
  isSelected: boolean;
  flat?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const isPurchased = status === "purchased";
  const isLocked = status === "locked";
  const clickable = status === "next"; // sirf next hi clickable

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onSelect(pkg.id)}
      className={`relative overflow-hidden rounded-2xl p-5 text-left bg-linear-to-br ${pkg.color} transition-all duration-200
        ${
          isPurchased
            ? "border-2 border-green-500"
            : status === "next"
              ? flat
                ? "shadow-md ring-2 ring-white"
                : isSelected
                  ? "-translate-y-3 shadow-2xl ring-2 ring-white scale-105"
                  : "translate-y-0 shadow-md opacity-90 hover:opacity-100 hover:-translate-y-1"
              : ""
        }
        ${isLocked ? "opacity-20 pointer-events-none cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <div className="text-white/80 text-xs font-medium mb-2">{pkg.label}</div>
      <div className="text-white text-lg font-bold">{pkg.amount}</div>

      {isPurchased && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/25 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-green-500/90 ring-2 ring-white/70 flex items-center justify-center shadow-lg">
              {/* <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] text-white font-semibold tracking-wide drop-shadow">
              Purchased
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
