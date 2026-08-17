// import React, { type ReactNode } from "react";
// import { Link } from "@tanstack/react-router";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// export interface BreadcrumbItem {
//   label: string;
//   to?: string;
// }

// export interface NavTarget {
//   label: string;
//   to: string;
// }

// export interface CycleNavProps {
//   current: number;
//   totalCycles: number;
//   cycleLabel?: string;
//   onPrev: () => void;
//   onNext: () => void;
//   onSelect?: (cycle: number) => void;
//   hasPrev?: boolean;
//   hasNext?: boolean;
// }

// export interface LevelPageLayoutProps {
//   breadcrumb: BreadcrumbItem[];
//   title: string;
//   uplineId?: string;
//   prevLevel?: NavTarget;
//   nextLevel?: NavTarget;
//   cycle?: CycleNavProps;
//   isLoading?: boolean;
//   children: ReactNode;
// }

// export default function LevelPageLayout({
//   breadcrumb,
//   title,
//   uplineId,
//   prevLevel,
//   nextLevel,
//   cycle,
//   isLoading,
//   children,
// }: LevelPageLayoutProps) {
//   return (
//     <div className="w-full">
//       <style>{`
//         @keyframes levelCardFadeIn {
//           from { opacity: 0; transform: translateY(6px) scale(0.98); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//       `}</style>

//       {/* Breadcrumb */}
//       <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2 flex-wrap">
//         {breadcrumb.map((item, i) => (
//           <React.Fragment key={i}>
//             {i > 0 && <span className="text-gray-600">/</span>}
//             {item.to ? (
//               <Link to={item.to} className="hover:text-white transition-colors">
//                 {item.label}
//               </Link>
//             ) : (
//               <span className={i === breadcrumb.length - 1 ? "text-white font-medium" : ""}>
//                 {item.label}
//               </span>
//             )}
//           </React.Fragment>
//         ))}
//       </div>

//       <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>

//       {/* Upline bar */}
//       {uplineId && (
//         <div className="bg-[#212123] hover:bg-[#313233] rounded-2xl px-6 py-4 mb-6 flex items-center justify-center gap-3">
//           <span className="text-white text-sm">Upline</span>
//           <span className="px-3 py-1 rounded-full bg-[#3b3c3d] text-white text-sm">{uplineId}</span>
//         </div>
//       )}

//       <div className="flex items-stretch gap-4">
//         <div className="flex-1 min-w-0 relative">
//           {isLoading ? (
//             <CardSkeleton />
//           ) : (
//             <div key={title} style={{ animation: "levelCardFadeIn 0.35s ease-out" }}>
//               {children}
//             </div>
//           )}
//         </div>

//       </div>

//       {/* Mobile: prev/next collapse into full-width buttons below the card */}
//       {(prevLevel || nextLevel) && (
//         <div className="flex md:hidden justify-between gap-3 mt-4">
//           {prevLevel ? (
//             <Link
//               to={prevLevel.to}
//               className="flex-1 flex justify-start items-center gap-1 rounded-xl px-3 py-3 text-white max-w-50 text-sm font-medium transition-colors"
//             >
//               <ChevronLeft size={16} /> {prevLevel.label}
//             </Link>
//           ) : (
//             <div className="flex-1" />
//           )}
//           {nextLevel ? (
//             <Link
//               to={nextLevel.to}
//               className="flex-1 flex gap-1 justify-end rounded-xl px-3 py-3 text-white text-right max-w-50 text-sm font-medium transition-colors"
//             >
//               {nextLevel.label} <ChevronRight size={16} />
//             </Link>
//           ) : (
//             <div className="flex-1" />
//           )}
//         </div>
//       )}

//       {/* Cycle nav */}
//       {cycle && (
//         <div className="flex items-center bg-[#212123] hover:bg-[#313233] justify-center gap-4 rounded-2xl max-w-2xl mx-auto px-6 py-4 mt-8">
//           <button
//             onClick={cycle.onPrev}
//             disabled={cycle.hasPrev === false}
//             className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             title="Previous Cycle"
//           >
//             {cycle.hasPrev && <span className="text-sm font-medium">{cycle.current - 1}</span>}
//             <ChevronLeft size={18} />
//           </button>

//           <span className="text-gray-200 text-sm font-semibold whitespace-nowrap">
//             Cycle: {cycle.current}
//           </span>

//           <button
//             onClick={cycle.onNext}
//             disabled={cycle.hasNext === false}
//             className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             title="Next Cycle"
//           >
//             <ChevronRight size={18} />
//             {cycle.hasNext && <span className="text-sm font-medium">{cycle.current + 1}</span>}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function CardSkeleton() {
//   return (
//     <div className="bg-neutral-800/60 rounded-2xl p-6 h-70 animate-pulse">
//       <div className="flex items-center justify-between mb-10">
//         <div className="h-6 w-14 bg-neutral-700 rounded" />
//         <div className="h-6 w-28 bg-neutral-700 rounded" />
//         <div className="h-6 w-10 bg-neutral-700 rounded" />
//       </div>
//       <div className="flex gap-4 mb-12">
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//       </div>
//       <div className="flex justify-between">
//         <div className="h-4 w-20 bg-neutral-700 rounded" />
//         <div className="h-4 w-32 bg-neutral-700 rounded" />
//       </div>
//     </div>
//   );
// }

import React, { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ProgramTypes } from "@/constants/programs";
import MatrixTreeCardXGoldSkeleton from "./skeletons/package-summery-card/magic-gold-matrix-summery-card-skeleton";
import MagicLevelSummaryCardSkeleton from "./skeletons/package-summery-card/magic-level-summary-card-skeleton";
import SponsorLevelSummaryCardSkeleton from "./skeletons/package-summery-card/sponsor-level-summary-card-skeleton";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface CycleNavProps {
  current: number;
  totalCycles: number;
  cycleLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (cycle: number) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export interface LevelNavProps {
  current: number;
  totalLevels: number;
  levelLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (level: number) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

// 👈 naya interface — level ke jaisa hi structure
export interface PackageNavProps {
  current: number;
  totalPackages: number;
  packageLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (pkg: number) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export interface LevelPageLayoutProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  uplineId?: string;
  level?: LevelNavProps;
  package?: PackageNavProps; // 👈 naya prop
  cycle?: CycleNavProps;
  isLoading?: boolean;
  children: ReactNode;
  program?: ProgramTypes;
}

export default function LevelPageLayout({
  breadcrumb,
  title,
  uplineId,
  level,
  package: pkg, // 👈 "package" reserved-ish word hai, isliye rename kiya destructure me
  cycle,
  isLoading,
  children,
  program,
}: LevelPageLayoutProps) {
  // level aur package dono me se jo bhi pass hua ho, wahi side-nav control karega
  const sideNav = level ?? pkg;
  const sideNavLabel = level ? "Level" : "Package";

  return (
    <div className="w-full">
      <style>{`
        @keyframes levelCardFadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2 flex-wrap">
        {breadcrumb.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-gray-600">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  i === breadcrumb.length - 1 ? "text-white font-medium" : ""
                }
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>

      {/* Upline bar */}
      {uplineId && (
        <div
          className={`bg-[#212123c9] hover:bg-[#313233] rounded-2xl px-6 py-4 mb-6 flex items-center justify-center gap-3`}
        >
          <span className="text-white text-sm">Upline</span>
          <span className="px-3 py-1 rounded-full bg-[#3b3c3d] text-white text-sm">
            {uplineId}
          </span>
        </div>
      )}

      <div className="flex items-stretch gap-3">
        {/* Prev button (desktop) — Level ya Package, jo bhi pass hua ho */}
        {sideNav && (
          <div className="hidden md:flex items-center">
            <button
              onClick={sideNav.onPrev}
              disabled={sideNav.hasPrev === false}
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4 bg-[#212123c9] hover:bg-[#313233] text-white text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={`Previous ${sideNavLabel}`}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0 relative">
          {isLoading ? (
            <>
              {program === "magicGoldMatrix" && <MatrixTreeCardXGoldSkeleton />}
              {program === "magicLevels" && <MagicLevelSummaryCardSkeleton />}
              {program === "sponserMagic" && <SponsorLevelSummaryCardSkeleton />}
            </>
          ) : (
            <div
              key={title}
              style={{ animation: "levelCardFadeIn 0.35s ease-out" }}
            >
              {children}
            </div>
          )}
        </div>

        {/* Next button (desktop) — Level ya Package, jo bhi pass hua ho */}
        {sideNav && (
          <div className="hidden md:flex items-center">
            <button
              onClick={sideNav.onNext}
              disabled={sideNav.hasNext === false}
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4 bg-[#212123c9] hover:bg-[#313233] text-white text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={`Next ${sideNavLabel}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile: prev/next collapse into full-width buttons below the card */}
      {sideNav && (
        <div className="flex md:hidden justify-between gap-3 mt-4">
          <button
            onClick={sideNav.onPrev}
            disabled={sideNav.hasPrev === false}
            className="flex-1 flex justify-start items-center gap-1 rounded-xl px-3 py-3 bg-[#212123c9] hover:bg-[#313233] text-white max-w-50 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} /> {sideNavLabel} {sideNav.current - 1}
          </button>

          <button
            onClick={sideNav.onNext}
            disabled={sideNav.hasNext === false}
            className="flex-1 flex gap-1 justify-end items-center rounded-xl px-3 py-3 bg-[#212123c9] hover:bg-[#313233] text-white text-right max-w-50 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {sideNavLabel} {sideNav.current + 1} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Cycle nav */}
      {cycle && (
        <div className="flex items-center bg-[#212123c9] hover:bg-[#313233c9] justify-center gap-4 rounded-2xl max-w-2xl mx-auto px-6 py-4 mt-8">
          <button
            onClick={cycle.onPrev}
            disabled={cycle.hasPrev === false}
            className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Cycle"
          >
            {cycle.hasPrev && (
              <span className="text-sm font-medium">{cycle.current - 1}</span>
            )}
            <ChevronLeft size={18} />
          </button>

          <span className="text-gray-200 text-sm font-semibold whitespace-nowrap">
            Cycle: {cycle.current}
          </span>

          <button
            onClick={cycle.onNext}
            disabled={cycle.hasNext === false}
            className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Cycle"
          >
            <ChevronRight size={18} />
            {cycle.hasNext && (
              <span className="text-sm font-medium">{cycle.current + 1}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// function CardSkeleton() {
//   return (
//     <div className="bg-neutral-800/60 rounded-2xl p-6 h-70 animate-pulse">
//       <div className="flex items-center justify-between mb-10">
//         <div className="h-6 w-14 bg-neutral-700 rounded" />
//         <div className="h-6 w-28 bg-neutral-700 rounded" />
//         <div className="h-6 w-10 bg-neutral-700 rounded" />
//       </div>
//       <div className="flex gap-4 mb-12">
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//       </div>
//       <div className="flex justify-between">
//         <div className="h-4 w-20 bg-neutral-700 rounded" />
//         <div className="h-4 w-32 bg-neutral-700 rounded" />
//       </div>
//     </div>
//   );
// }

// import React, { type ReactNode } from "react";
// import { Link } from "@tanstack/react-router";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// export interface BreadcrumbItem {
//   label: string;
//   to?: string;
// }

// export interface NavTarget {
//   label: string;
//   to: string;
//   search?: Record<string, string | number | boolean | undefined>;
// }

// export interface CycleNavProps {
//   current: number;
//   totalCycles: number;
//   cycleLabel?: string;
//   onPrev: () => void;
//   onNext: () => void;
//   onSelect?: (cycle: number) => void;
//   hasPrev?: boolean;
//   hasNext?: boolean;
// }

// export interface LevelPageLayoutProps {
//   breadcrumb: BreadcrumbItem[];
//   title: string;
//   uplineId?: string;
//   prevLevel?: NavTarget;
//   nextLevel?: NavTarget;
//   cycle?: CycleNavProps;

//   isLoading?: boolean;
//   children: ReactNode;
// }

// export default function LevelPageLayout({
//   breadcrumb,
//   title,
//   uplineId,
//   prevLevel,
//   nextLevel,
//   cycle,
//   isLoading,
//   children,
// }: LevelPageLayoutProps) {
//   return (
//     <div className="w-full">
//       <style>{`
//         @keyframes levelCardFadeIn {
//           from { opacity: 0; transform: translateY(6px) scale(0.98); }
//           to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//       `}</style>

//       {/* Breadcrumb */}
//       <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2 flex-wrap">
//         {breadcrumb.map((item, i) => (
//           <React.Fragment key={i}>
//             {i > 0 && <span className="text-gray-600">/</span>}
//             {item.to ? (
//               <Link to={item.to} className="hover:text-white transition-colors">
//                 {item.label}
//               </Link>
//             ) : (
//               <span className={i === breadcrumb.length - 1 ? "text-white font-medium" : ""}>
//                 {item.label}
//               </span>
//             )}
//           </React.Fragment>
//         ))}
//       </div>

//       <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>

//       {/* Upline bar */}
//       {uplineId && (
//         <div className="bg-[#212123] hover:bg-[#313233] rounded-2xl px-6 py-4 mb-6 flex items-center justify-center gap-3">
//           <span className="text-white text-sm">Upline</span>
//           <span className="px-3 py-1 rounded-full bg-[#3b3c3d] text-white text-sm">{uplineId}</span>
//         </div>
//       )}

//       <div className="flex items-stretch gap-3">
//         {/* Prev Level button (desktop) */}
//         {(prevLevel || nextLevel) && (
//           <div className="hidden md:flex items-center">
//             {prevLevel ? (
//               <Link
//                 to={prevLevel.to}
//                 search={prevLevel.search}
//                 className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4 bg-[#212123] hover:bg-[#313233] text-white text-xs font-medium transition-colors"
//                 title={prevLevel.label}
//               >
//                 <ChevronLeft size={20} />
//               </Link>
//             ) : (
//               <div className="w-11" />
//             )}
//           </div>
//         )}

//         <div className="flex-1 min-w-0 relative">
//           {isLoading ? (
//             <CardSkeleton />
//           ) : (
//             <div key={title} style={{ animation: "levelCardFadeIn 0.35s ease-out" }}>
//               {children}
//             </div>
//           )}
//         </div>

//         {/* Next Level button (desktop) */}
//         {(prevLevel || nextLevel) && (
//           <div className="hidden md:flex items-center">
//             {nextLevel ? (
//               <Link
//                 to={nextLevel.to}
//                 search={nextLevel.search}
//                 className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-4 bg-[#212123] hover:bg-[#313233] text-white text-xs font-medium transition-colors"
//                 title={nextLevel.label}
//               >
//                 <ChevronRight size={20} />
//               </Link>
//             ) : (
//               <div className="w-11" />
//             )}
//           </div>
//         )}
//       </div>

//       {/* Mobile: prev/next collapse into full-width buttons below the card */}
//       {(prevLevel || nextLevel) && (
//         <div className="flex md:hidden justify-between gap-3 mt-4">
//           {prevLevel ? (
//             <Link
//               to={prevLevel.to}
//               search={prevLevel.search}
//               className="flex-1 flex justify-start items-center gap-1 rounded-xl px-3 py-3 bg-[#212123] hover:bg-[#313233] text-white max-w-50 text-sm font-medium transition-colors"
//             >
//               <ChevronLeft size={16} /> {prevLevel.label}
//             </Link>
//           ) : (
//             <div className="flex-1" />
//           )}
//           {nextLevel ? (
//             <Link
//               to={nextLevel.to}
//               search={nextLevel.search}
//               className="flex-1 flex gap-1 justify-end items-center rounded-xl px-3 py-3 bg-[#212123] hover:bg-[#313233] text-white text-right max-w-50 text-sm font-medium transition-colors"
//             >
//               {nextLevel.label} <ChevronRight size={16} />
//             </Link>
//           ) : (
//             <div className="flex-1" />
//           )}
//         </div>
//       )}

//       {/* Cycle nav */}
//       {cycle && (
//         <div className="flex items-center bg-[#212123] hover:bg-[#313233] justify-center gap-4 rounded-2xl max-w-2xl mx-auto px-6 py-4 mt-8">
//           <button
//             onClick={cycle.onPrev}
//             disabled={cycle.hasPrev === false}
//             className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             title="Previous Cycle"
//           >
//             {cycle.hasPrev && <span className="text-sm font-medium">{cycle.current - 1}</span>}
//             <ChevronLeft size={18} />
//           </button>

//           <span className="text-gray-200 text-sm font-semibold whitespace-nowrap">
//             Cycle: {cycle.current}
//           </span>

//           <button
//             onClick={cycle.onNext}
//             disabled={cycle.hasNext === false}
//             className="flex items-center gap-1 text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             title="Next Cycle"
//           >
//             <ChevronRight size={18} />
//             {cycle.hasNext && <span className="text-sm font-medium">{cycle.current + 1}</span>}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function CardSkeleton() {
//   return (
//     <div className="bg-neutral-800/60 rounded-2xl p-6 h-70 animate-pulse">
//       <div className="flex items-center justify-between mb-10">
//         <div className="h-6 w-14 bg-neutral-700 rounded" />
//         <div className="h-6 w-28 bg-neutral-700 rounded" />
//         <div className="h-6 w-10 bg-neutral-700 rounded" />
//       </div>
//       <div className="flex gap-4 mb-12">
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//         <div className="w-16 h-16 rounded-full bg-neutral-700" />
//       </div>
//       <div className="flex justify-between">
//         <div className="h-4 w-20 bg-neutral-700 rounded" />
//         <div className="h-4 w-32 bg-neutral-700 rounded" />
//       </div>
//     </div>
//   );
// }
