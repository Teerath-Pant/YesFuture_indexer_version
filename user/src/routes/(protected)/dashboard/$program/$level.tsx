import { createFileRoute, redirect } from "@tanstack/react-router";
import PageLayout from "@/layouts/page-layout";

import { XThreeLevelPage, XGoldLevelPage } from "@/components/level-pages";
import type { ProgramTypes } from "@/constants/programs";
import MagicLevelPackagePage from "@/components/level-pages/magic-level-package-page";
import { UserMaxPackagesSummery } from "@/lib/auth-api";
import { getConnectedAccounts } from "@/lib/wallet";


const MAX_LEVEL_FIELD_BY_PROGRAM: Record<
  string,
  "matrixMaxPkg" | "sponsorMaxPkg" | "levelMaxPkg"
> = {
  magicgoldmatrix: "matrixMaxPkg",
  sponsermagic: "sponsorMaxPkg",
  magiclevels: "levelMaxPkg",
};

export async function guardLevelAccess({
  program,
  level,
  address,
  redirectTo,
}: {
  program: string;
  level: string;
  address: string | undefined | null;
  redirectTo: string; 
}) {
  const key = program.toLowerCase();
  const field = MAX_LEVEL_FIELD_BY_PROGRAM[key];

  if (!field || !address) return;

  const summary = await UserMaxPackagesSummery(address);
  const maxUnlockedLevel = summary[field];

  const levelNum = Number(level);

  if (maxUnlockedLevel > 0 && levelNum > maxUnlockedLevel) {
    throw redirect({
      to: redirectTo,
      params: { program, level: String(maxUnlockedLevel) },
      search: (prev) => ({ ...prev }),
      replace: true,
    });
  }
}

export const Route = createFileRoute("/(protected)/dashboard/$program/$level")({
  beforeLoad: async ({ params }) => {
    const accounts = await getConnectedAccounts();
    const myWalletAddress = accounts[0];

    await guardLevelAccess({
      program: params.program,
      level: params.level,
      address: myWalletAddress,
      redirectTo: "/dashboard/$program/$level",
    });
  },
  component: LevelPage,
});
function LevelPage() {
  const { program, level }: { program: ProgramTypes; level: string } =
    Route.useParams();
    
    return (
      <PageLayout>
      {program.toLowerCase() === "sponsermagic" && (
        <XThreeLevelPage level={level} program={program} />
      )}
      {program.toLowerCase() === "magicgoldmatrix" && (
        <XGoldLevelPage level={level} program={program} />
      )}
      {program.toLowerCase() === "magiclevels" && (
        <MagicLevelPackagePage level={level} program={program} />
      )}
    </PageLayout>
  );
}
