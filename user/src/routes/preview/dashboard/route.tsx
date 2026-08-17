import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
