import { createFileRoute } from "@tanstack/react-router";
import PageLayout from "@/layouts/page-layout";
import {type ProgramTypes } from "@/constants/programs";
import PreviewUserSponserMagic from "@/components/preview/program-pages/sponser-magic";
import PreviewUserMagicGoldMatrix from "@/components/preview/program-pages/magic-gold-matrix";
import PreviewUserMagicLevels from "@/components/preview/program-pages/magic-level";

export const Route = createFileRoute("/preview/dashboard/$program/")({
  component: ProgramPage,
});

function ProgramPage() {
  const { program }: { program: ProgramTypes } = Route.useParams();
  return (
    <PageLayout>
      {program.toLowerCase() === "sponsermagic" && <PreviewUserSponserMagic program={program} />}
      {program.toLowerCase() === "magicgoldmatrix" && <PreviewUserMagicGoldMatrix program={program} />}
      {program.toLowerCase() === "magiclevels" && <PreviewUserMagicLevels program={program} />}
    </PageLayout>
  );
}
