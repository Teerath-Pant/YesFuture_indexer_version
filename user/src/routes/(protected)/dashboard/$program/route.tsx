import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/dashboard/$program")({
  component: ProgramLayout,
});

function ProgramLayout() {
  return <Outlet />;
}