import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
// 1. IMPORT YOUR NEW WALLET GUARD HERE
import { WalletGuard } from "@/components/WalletGuard";
// import { Sheet, SheetContent } from "@/components/ui/sheet";

export const Route = createFileRoute("/(protected)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    // 2. WRAP YOUR ENTIRE ORIGINAL UI WITH THE GUARD
    <WalletGuard>
      <div className="flex h-screen w-full max-w-6xl px-2 sm:px-4 mx-auto flex-col">
        {/* 1. TOP NAVBAR (Poori width) */}
        <Header />
        {/* 2. MAIN CONTENT AREA (Left Sidebar + Right Content/Outlet) */}
        <div className="flex flex-1 min-h-0">
          {/* Left Side: Desktop Sidebar */}
          <aside className="hidden lg:block shrink-0 border-r border-border">
            <Sidebar />
          </aside>

          {/* Right Side: Main Page Content + Footer */}
          <div className="flex min-w-0 min-h-0 flex-1 flex-col justify-between">
            <main className="flex-1 px-1 sm:px-3 py-6 overflow-y-auto scrollbarNone md:px-8 md:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}