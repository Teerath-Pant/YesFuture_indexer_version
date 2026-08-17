import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/package-purchase")({
  component: ()=><Outlet/>,
});