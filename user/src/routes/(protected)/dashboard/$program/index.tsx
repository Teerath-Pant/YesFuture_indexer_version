import { createFileRoute } from "@tanstack/react-router";
import {  SponserMagic, MagicGoldMatrix } from "@/components/program-pages";
import PageLayout from "@/layouts/page-layout";
import {type ProgramTypes } from "@/constants/programs";
import MagicLevels from "@/components/program-pages/magic-level";

export const Route = createFileRoute("/(protected)/dashboard/$program/")({
  component: ProgramPage,
});

function ProgramPage() {
  const { program }: { program: ProgramTypes } = Route.useParams();
  return (
    <PageLayout>
      {program.toLowerCase() === "sponsermagic" && <SponserMagic program={program} />}
      {program.toLowerCase() === "magicgoldmatrix" && <MagicGoldMatrix program={program} />}
      {program.toLowerCase() === "magiclevels" && <MagicLevels program={program} />}
    </PageLayout>
  );
}
