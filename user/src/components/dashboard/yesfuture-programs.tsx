// import React from "react";
// import { MoreVertical } from "lucide-react";
import { ProgramCard, type ProgramCardProps } from "./program-card";
export type Props = {
id:string;
} & ProgramCardProps;

interface ProgramsProps {
  totalDirectIncome: string;
  totalLevelIncome: string;
  totalMatrixIncome: string;
}

export function YesfuturePrograms(income:ProgramsProps) {
  const programsData:Props[] = [
    {
      id: "x3",
      titleText: "sponserMagic",
      description:"",
      totalProfit: income.totalDirectIncome,
      activeLevels: 9,
      previewLabel: "x3 Preview",
      accentColor: "#3b82f6", // Blue
    },
    {
      id: "x4",
      titleText: "magicGoldMatrix",
      description:"",
      totalProfit: income.totalMatrixIncome,
      activeLevels: 7,
      previewLabel: "x4 Preview",
      accentColor: "#a855f7", // Purple
    },
    {
      id: "x5",
      titleText: "magicLevels",
      description:"",
      totalProfit: income.totalLevelIncome,
      activeLevels: 7,
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

        {/* <button className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1e222d] px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10">
          <MoreVertical className="h-3.5 w-3.5" />
          <span>More info</span>
        </button> */}
      </div>

      {/* Grid Container (Mobile 1 Col, Desktop 2 Col) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {programsData.map((prog) => (
          <ProgramCard
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
