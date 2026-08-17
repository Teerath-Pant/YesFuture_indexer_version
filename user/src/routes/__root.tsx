import { Outlet, createRootRoute } from "@tanstack/react-router";
import "../App.css";
import { Toaster } from "sonner";
import { NotFoundComponent } from "@/components/not-found";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center">
      {/* <div className="bg-[#16161700]"> */}

      <Outlet />
      <Toaster />
    </div>
  ),
  notFoundComponent: NotFoundComponent,
});
