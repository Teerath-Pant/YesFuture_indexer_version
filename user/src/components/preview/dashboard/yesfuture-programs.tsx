// // import React from "react";
// // import { MoreVertical } from "lucide-react";
// import { PreviewProgramCard, type ProgramCardProps } from "./program-card";
// export type Props = {
// id:string;
// } & ProgramCardProps;

// interface ProgramsProps {
//   totalDirectIncome: number;
//   totalLevelIncome: number;
//   totalMatrixIncome: number;
// }

// export function PreviewYesfuturePrograms(income:ProgramsProps) {
//   const programsData:Props[] = [
//     {
//       id: "x3",
//       titleText: "sponserMagic",
//       description:"",
//       totalProfit: income.totalDirectIncome,
//       activeLevels: 9,
//       previewLabel: "x3 Preview",
//       accentColor: "#3b82f6", // Blue
//     },
//     {
//       id: "x4",
//       titleText: "magicGoldMatrix",
//       description:"",
//       totalProfit: income.totalMatrixIncome,
//       activeLevels: 7,
//       previewLabel: "x4 Preview",
//       accentColor: "#a855f7", // Purple
//     },
//     {
//       id: "x5",
//       titleText: "magicLevels",
//       description:"",
//       totalProfit: income.totalLevelIncome,
//       activeLevels: 7,
//       previewLabel: "x4 Preview",
//       accentColor: "#50cbf0", // Purple
//     },
//   ];

//   return (
//     <div className="w-full text-white">
//       {/* Header Bar */}
//       <div className="mb-6 flex items-center justify-between">
//         <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
//           Yesfuture Programs
//         </h2>
//       </div>

//       {/* Grid Container (Mobile 1 Col, Desktop 2 Col) */}
//       <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//         {programsData.map((prog) => (
//           <PreviewProgramCard
//             key={prog.id}
//             titleText={prog.titleText}
//             totalProfit={prog.totalProfit}
//             description={prog.description}
//             activeLevels={prog.activeLevels}
//             previewLabel={prog.previewLabel}
//             accentColor={prog.accentColor}
//             onClickPreview={() => console.log(`Clicked ${prog.titleText}`)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { PreviewProgramCard, type ProgramCardProps } from "./program-card";
import { fetchProgramMaxLevels } from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";

export type Props = {
  id: string;
} & ProgramCardProps;

interface ProgramsProps {
  totalDirectIncome: number;
  totalLevelIncome: number;
  totalMatrixIncome: number;
}

export function PreviewYesfuturePrograms(income: ProgramsProps) {
  const { address } = useWallet();
  const [maxLevels, setMaxLevels] = useState({ matrixMax: 0, sponsorMax: 0, levelMax: 0 });

  useEffect(() => {
    if (!address) return;
    fetchProgramMaxLevels(address)
      .then(setMaxLevels)
      .catch((err) => console.error("Error fetching program max levels:", err));
  }, [address]);

  const programsData: Props[] = [
    {
      id: "x3",
      titleText: "sponserMagic",
      description: "",
      totalProfit: income.totalDirectIncome,
      activeLevels: Math.max(maxLevels.sponsorMax, 1),
      previewLabel: "x3 Preview",
      accentColor: "#3b82f6", // Blue
    },
    {
      id: "x4",
      titleText: "magicGoldMatrix",
      description: "",
      totalProfit: income.totalMatrixIncome,
      activeLevels: Math.max(maxLevels.matrixMax, 1),
      previewLabel: "x4 Preview",
      accentColor: "#a855f7", // Purple
    },
    {
      id: "x5",
      titleText: "magicLevels",
      description: "",
      totalProfit: income.totalLevelIncome,
      activeLevels: Math.max(maxLevels.levelMax, 1),
      previewLabel: "x4 Preview",
      accentColor: "#50cbf0", // Purple
    },
  ];

  return (
    <div className="w-full text-white">
      {/* Header Bar */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Yesfuture Programs
        </h2>
      </div>

      {/* Grid Container (Mobile 1 Col, Desktop 2 Col) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {programsData.map((prog) => (
          <PreviewProgramCard
            key={prog.id}
            titleText={prog.titleText}
            totalProfit={prog.totalProfit}
            description={prog.description}
            activeLevels={prog.activeLevels}
            previewLabel={prog.previewLabel}
            accentColor={prog.accentColor}
            onClickPreview={() => console.log(`Clicked ${prog.titleText}`)}
          />
        ))}
      </div>
    </div>
  );
}