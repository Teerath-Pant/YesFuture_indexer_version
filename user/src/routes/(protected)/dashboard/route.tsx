import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
