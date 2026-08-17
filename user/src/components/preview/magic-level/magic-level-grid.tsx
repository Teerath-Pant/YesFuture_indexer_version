// import { PreviewUserMagicLevelCard,type LevelData } from "./magic-level-card";

// interface MatrixGridProps {
//   levels: LevelData[];
// }

// export function PreviewMagicLevel({ levels }: MatrixGridProps) {
//   return (
//     <div className="rounded-3xl border border-white/5 p-4 shadow-2xl sm:p-6 bg-[radial-gradient(ellipse_80%_150%_at_80%_100%,#3b82f6_0%,#1d1e1f_55%)]">
//       {/* 5 Column Responsive Grid */}
//       <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
//         {levels.map((lvl) => (
//           <PreviewUserMagicLevelCard key={lvl.level} {...lvl} />
//         ))}
//       </div>
//     </div>
//   );
// }


import { PreviewUserMagicLevelCard, type LevelData } from "./magic-level-card";

interface MatrixGridProps {
  levels: LevelData[];
}

export function PreviewMagicLevel({ levels }: MatrixGridProps) {
  return (
    <div className="rounded-3xl border border-white/5 p-4 shadow-2xl sm:p-6 bg-[radial-gradient(ellipse_80%_150%_at_80%_100%,#3b82f6_0%,#1d1e1f_55%)]">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
        {levels.map((lvl) => (
          <PreviewUserMagicLevelCard key={lvl.level} {...lvl} />
        ))}
      </div>
    </div>
  );
}