// import { Check, Star } from "lucide-react";

// interface RankListProps {
//   currentValue: number; // total members / direct count jisse har rank ka requirement compare hoga
//   imageExt?: string;
// }

// const RANKS = [
//   { level: 1, requirement: 5, label: "5 Direct" },
//   { level: 2, requirement: 25, label: "25 Members" },
//   { level: 3, requirement: 125, label: "125 Members" },
//   { level: 4, requirement: 625, label: "625 Members" },
//   { level: 5, requirement: 3125, label: "3,125 Members" },
//   { level: 6, requirement: 15625, label: "15,625 Members" },
//   { level: 7, requirement: 78125, label: "78,125 Members" },
// ];

// export default function RankList({ currentValue, imageExt = "png" }: RankListProps) {
//   return (

//     <div className="flex flex-col gap-3 rounded-2xl bg-[#212123c9] p-6 border border-white/5">
//       <span className="text-sm font-medium text-gray-300 mb-3">Rank Overview</span>

//       {RANKS.map(({ level, requirement, label }) => {
//         const percent = Math.min(100, Math.round((currentValue / requirement) * 100));
//         const achieved = currentValue >= requirement;

//         return (
//           <div
//             key={level}
//             className="flex items-center gap-4 rounded-xl bg-[#292930] px-4 py-3"
//           >
//             {/* Badge */}
//             <div className="relative shrink-0 h-12 w-12">
//               <img
//                 src={`/ranks/rank${level}.${imageExt}`}
//                 alt={`Rank ${level}`}
//                 className={[
//                   "h-full w-full object-contain select-none pointer-events-none transition-all duration-300",
//                   achieved ? "opacity-100" : "grayscale opacity-40",
//                 ].join(" ")}
//               />
//             </div>

//             {/* Rank number + star */}
//             <div className="flex items-center gap-1 w-16 shrink-0">
//               <span className="text-sm font-semibold text-white">{level}</span>
//               <Star
//                 className={[
//                   "h-3.5 w-3.5",
//                   achieved
//                     ? "fill-yellow-400 text-yellow-400"
//                     : "fill-gray-600 text-gray-600",
//                 ].join(" ")}
//               />
//             </div>

//             {/* Progress bar */}
//             <div className="flex-1 min-w-0">
//               <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
//                 <div
//                   className={[
//                     "h-full rounded-full transition-all duration-500 ease-out",
//                     achieved ? "bg-[#3db188]" : "bg-[#3db188]/60",
//                   ].join(" ")}
//                   style={{ width: `${percent}%` }}
//                 />
//               </div>
//               <span className="mt-1 block text-[11px] text-gray-500">{label}</span>
//             </div>

//             {/* Status */}
//             <div className="flex items-center gap-1.5 w-24 justify-end shrink-0">
//               {achieved ? (
//                 <>
//                   <span className="text-xs font-semibold text-[#3db188]">
//                     Achieved
//                   </span>
//                   <Check className="h-4 w-4 text-[#3db188]" strokeWidth={3} />
//                 </>
//               ) : (
//                 <span className="text-xs font-medium text-gray-400">{percent}%</span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import { Check, Star } from "lucide-react";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { fetchTeamCountUpToLevel7 } from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";

interface RankListProps {
  walletAddress?: string;
  imageExt?: string;
}

const RANKS = [
  { level: 1, requirement: 5, label: "5 Direct" },
  { level: 2, requirement: 25, label: "25 Members" },
  { level: 3, requirement: 125, label: "125 Members" },
  { level: 4, requirement: 625, label: "625 Members" },
  { level: 5, requirement: 3125, label: "3,125 Members" },
  { level: 6, requirement: 15625, label: "15,625 Members" },
  { level: 7, requirement: 78125, label: "78,125 Members" },
];

export default function RankList({ imageExt = "png" }: RankListProps) {
  const { address: walletAddress } = useWallet();
  const { data: teamLevels = [], isLoading } = useCachedFetch(
    walletAddress ? `team-count-levels:${walletAddress}` : null,
    () => fetchTeamCountUpToLevel7(walletAddress ?? ""),
    { staleTime: 60_000 },
  );

  // level -> count ka quick lookup
  const countByLevel = new Map(
    teamLevels.map((item) => [item.level, item.count]),
  );

  // cascade logic: rank N sirf tab achieved jab rank N-1 bhi achieved ho
  let previousAchieved = true;
  const ranksWithStatus = RANKS.map(({ level, requirement, label }) => {
    const currentCount = countByLevel.get(level) ?? 0;
    const meetsOwnRequirement = currentCount >= requirement;
    const achieved = meetsOwnRequirement && previousAchieved;
    const percent = Math.min(
      100,
      Math.round((currentCount / requirement) * 100),
    );

    previousAchieved = achieved; // agli rank ke liye carry aage

    return { level, requirement, label, currentCount, achieved, percent };
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-[#212123c9] p-6 border border-white/5">
        <span className="text-sm font-medium text-gray-300 mb-3">
          Rank Overview
        </span>
        <div className="text-sm text-gray-500 text-center py-6">
          Loading ranks...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#212123c9] p-6 border border-white/5">
      <span className="text-sm font-medium text-gray-300 mb-3">
        Rank Overview
      </span>

      {ranksWithStatus.map(({ level, label, achieved, percent }) => (
        <div
          key={level}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl bg-[#292930] px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 h-12 w-12">
              <img
                src={`/ranks/rank${level}.${imageExt}`}
                alt={`Rank ${level}`}
                className={[
                  "h-full w-full object-contain select-none pointer-events-none transition-all duration-300",
                  achieved ? "opacity-100" : "grayscale opacity-40",
                ].join(" ")}
              />
            </div>

            <div className="flex items-center gap-1 w-16 shrink-0">
              <span className="text-sm font-semibold text-white">{level}</span>
              <Star
                className={[
                  "h-3.5 w-3.5",
                  achieved
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-600 text-gray-600",
                ].join(" ")}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500 ease-out",
                    achieved ? "bg-[#3db188]" : "bg-[#3db188]/60",
                  ].join(" ")}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="mt-1 block text-[11px] text-gray-500">
                {label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:w-24 justify-end shrink-0">
              {achieved ? (
                <>
                  <span className="text-xs font-semibold text-[#3db188]">
                    Achieved
                  </span>
                  <Check className="h-4 w-4 text-[#3db188]" strokeWidth={3} />
                </>
              ) : (
                <span className="text-xs font-medium text-gray-400">
                  {percent}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// import { Check, Star } from "lucide-react";

// interface RankListProps {
//   currentValue: number; // total members / direct count jisse har rank ka requirement compare hoga
//   imageExt?: string;
// }

// const RANKS = [
//   { level: 1, requirement: 5, label: "5 Direct" },
//   { level: 2, requirement: 25, label: "25 Members" },
//   { level: 3, requirement: 125, label: "125 Members" },
//   { level: 4, requirement: 625, label: "625 Members" },
//   { level: 5, requirement: 3125, label: "3,125 Members" },
//   { level: 6, requirement: 15625, label: "15,625 Members" },
//   { level: 7, requirement: 78125, label: "78,125 Members" },
// ];

// export default function RankList({ currentValue, imageExt = "png" }: RankListProps) {
//   return (
//     <div className="flex flex-col gap-3 rounded-2xl bg-[#212123c9] p-6 border border-white/5">
//       <span className="text-sm font-medium text-gray-300 mb-3">Rank Overview</span>

//       {RANKS.map(({ level, requirement, label }) => {
//         const percent = Math.min(100, Math.round((currentValue / requirement) * 100));
//         const achieved = currentValue >= requirement;

//         return (
//           <div
//             key={level}
//             className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl bg-[#292930] px-4 py-3"
//           >
//             {/* Top row on mobile: badge + rank number */}
//             <div className="flex items-center gap-4">
//               {/* Badge */}
//               <div className="relative shrink-0 h-12 w-12">
//                 <img
//                   src={`/ranks/rank${level}.${imageExt}`}
//                   alt={`Rank ${level}`}
//                   className={[
//                     "h-full w-full object-contain select-none pointer-events-none transition-all duration-300",
//                     achieved ? "opacity-100" : "grayscale opacity-40",
//                   ].join(" ")}
//                 />
//               </div>

//               {/* Rank number + star */}
//               <div className="flex items-center gap-1 w-16 shrink-0">
//                 <span className="text-sm font-semibold text-white">{level}</span>
//                 <Star
//                   className={[
//                     "h-3.5 w-3.5",
//                     achieved
//                       ? "fill-yellow-400 text-yellow-400"
//                       : "fill-gray-600 text-gray-600",
//                   ].join(" ")}
//                 />
//               </div>
//             </div>

//             {/* Bottom on mobile / middle+right on desktop: progress + status */}
//             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
//               {/* Progress bar */}
//               <div className="flex-1 min-w-0">
//                 <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
//                   <div
//                     className={[
//                       "h-full rounded-full transition-all duration-500 ease-out",
//                       achieved ? "bg-[#3db188]" : "bg-[#3db188]/60",
//                     ].join(" ")}
//                     style={{ width: `${percent}%` }}
//                   />
//                 </div>
//                 <span className="mt-1 block text-[11px] text-gray-500">{label}</span>
//               </div>

//               {/* Status */}
//               <div className="flex items-center gap-1.5 sm:w-24 justify-end shrink-0">
//                 {achieved ? (
//                   <>
//                     <span className="text-xs font-semibold text-[#3db188]">
//                       Achieved
//                     </span>
//                     <Check className="h-4 w-4 text-[#3db188]" strokeWidth={3} />
//                   </>
//                 ) : (
//                   <span className="text-xs font-medium text-gray-400">{percent}%</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
