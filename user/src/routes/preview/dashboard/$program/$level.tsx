import { createFileRoute, redirect } from "@tanstack/react-router";
import PageLayout from "@/layouts/page-layout";
import type { ProgramTypes } from "@/constants/programs";
import PreviewMagicLevelPackagePage from "@/components/preview/level-pages/magic-level-package-page";
import PreviewSponsorMagicPackagePage from "@/components/preview/level-pages/sponsor-magic-package-page";
import PreviewMagicGoldMatrixLevelPackagePage from "@/components/preview/level-pages/magic-gold-matrix-package-page";
import {
  getWalletAddressFromUserId,
  UserMaxPackagesSummery,
} from "@/lib/auth-api";

interface SearchParams {
  id?: string;
  level?: number;
  cycle?: number;
}

const MAX_LEVEL_FIELD_BY_PROGRAM: Record<
  string,
  "matrixMaxPkg" | "sponsorMaxPkg" | "levelMaxPkg"
> = {
  magicgoldmatrix: "matrixMaxPkg",
  sponsermagic: "sponsorMaxPkg",
  magiclevels: "levelMaxPkg",
};

async function guardLevelAccess({
  program,
  level,
  searchId,
}: {
  program: string;
  level: string;
  searchId: string | undefined;
}) {
  const key = program.toLowerCase();
  const field = MAX_LEVEL_FIELD_BY_PROGRAM[key];

  if (!field || !searchId) return;

  const address = await getWalletAddressFromUserId(searchId);
  if (!address) return;

  const summary = await UserMaxPackagesSummery(address);
  const maxUnlockedLevel = summary[field];

  const levelNum = Number(level);

  if (maxUnlockedLevel > 0 && levelNum > maxUnlockedLevel) {
    throw redirect({
      to: "/preview/dashboard/$program/$level",
      params: { program, level: String(maxUnlockedLevel) },
      search: (prev) => ({ ...prev }),
      replace: true,
    });
  }
}

export const Route = createFileRoute("/preview/dashboard/$program/$level")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      id: search.id as string | undefined,
      level: search.level as number | undefined,
      cycle: search.cycle as number | undefined,
    };
  },
  beforeLoad: async ({ params, search }) => {
    await guardLevelAccess({
      program: params.program,
      level: params.level,
      searchId: search.id,
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
        <PreviewSponsorMagicPackagePage level={level} program={program} />
      )}
      {program.toLowerCase() === "magicgoldmatrix" && (
        <PreviewMagicGoldMatrixLevelPackagePage
          level={level}
          program={program}
        />
      )}
      {program.toLowerCase() === "magiclevels" && (
        <PreviewMagicLevelPackagePage level={level} program={program} />
      )}
    </PageLayout>
  );
}
