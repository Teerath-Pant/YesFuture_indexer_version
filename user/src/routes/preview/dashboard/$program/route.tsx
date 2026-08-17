import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/dashboard/$program")({
  component: ProgramLayout,
});

function ProgramLayout() {
  return <Outlet />; // yahi missing tha, isi wajah se child render nahi ho raha tha
}