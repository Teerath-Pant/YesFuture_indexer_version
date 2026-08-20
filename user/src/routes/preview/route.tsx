

import { PreviewHeader } from "@/components/preview/preview-header";
import { PreviewSidebar } from "@/components/preview/preview-sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { checkTeamMembership } from "@/lib/auth-api";
import { getConnectedAccounts, isWalletAvailable } from "@/lib/wallet"; // hook nahi, plain function
import { toast } from "sonner";

let lastValidPreviewLocation: {
  pathname: string;
  search: Record<string, unknown>;
} | null = null;

export const Route = createFileRoute("/preview")({
  validateSearch: z.object({
    id: z.string().optional(),
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.id) {
      throw redirect({
        to: "/sign-in",
        replace: true,
      });
    }
    if (!isWalletAvailable()) {
      throw redirect({
        to: "/sign-in",
        replace: true,
      });
    }
    const accounts = await getConnectedAccounts();
    const myWalletAddress = accounts[0] ?? null;

    if (!myWalletAddress) {
      throw redirect({
        to: "/sign-in",
        replace: true,
      });
    }

    const result = await checkTeamMembership(myWalletAddress, search.id);

    if (!result.valid) {
      toast.error("You can only view user IDs within your team.");

      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        throw redirect({ to: "/dashboard", replace: true });
      }

      throw redirect({ to: location.pathname, search: location.search });
    }

    lastValidPreviewLocation = {
      pathname: location.pathname,
      search: search as Record<string, unknown>,
    };
  },
  pendingComponent: PreviewLoading,
  pendingMs: 300,
  pendingMinMs: 500,
  component: RouteComponent,
});

function PreviewLoading() {
  return (
    <div className="flex h-screen bg-white/10 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 relative">
        <div className="h-48 w-48 animate-spin rounded-full border-4  border-amber-300 border-t-transparent" />
        <img
          src="/logo.png"
          alt="logo"
          className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="flex h-screen w-full max-w-6xl px-1 sm:px-4 mx-auto flex-col">
      <PreviewHeader />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:block shrink-0 border-r border-border">
          <PreviewSidebar />
        </aside>
        <div className="flex min-w-0 min-h-0 flex-1 flex-col justify-between">
          <main className="flex-1 px-1 sm:px-3 py-6 overflow-y-auto scrollbarNone md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}