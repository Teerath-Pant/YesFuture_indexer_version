import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RecentActivety } from "@/components/dashboard/recent-activety";
import { YesfuturePrograms } from "@/components/dashboard/yesfuture-programs";
import { UserProfileHeader } from "@/components/dashboard/profile-header";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { useWallet } from "@/lib/use-wallet";
import {
  fetchIncomeStats,
} from "@/lib/auth-api";
import { Loader2 } from "lucide-react";
import RankProgressCard from "@/components/rank-progress-card";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { address: connectedWallet, isConnecting } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [totalProfit, setTotalProfit] = useState<string>("0");
  const [totalLevelIncome, setTotalLevelIncome] = useState<string>("0");
  const [totalMatrixIncome, setTotalMatrixIncome] = useState<string>("0");

  const [totalDirectIncome, setTotalDirectIncome] = useState<string>("0");

  const navigate = useNavigate();

  useEffect(() => {
    const checkWallet = setTimeout(() => {
      if (!isConnecting && !connectedWallet) {
        navigate({ to: "/sign-in" });
      }
    }, 500);
    return () => clearTimeout(checkWallet);
  }, [connectedWallet, isConnecting, navigate]);

  useEffect(() => {
    if (!connectedWallet) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const incomeData = await fetchIncomeStats(connectedWallet);
        if (isMounted && incomeData) {
          setTotalProfit(incomeData.totalIncome || "0");
          setTotalLevelIncome(incomeData.totalMagicLevelIncome || "0");
          setTotalMatrixIncome(incomeData.totalMagicGoldMatrixIncome || "0");
          setTotalDirectIncome(incomeData.totalSponsorIncome || "0");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [connectedWallet]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <UserProfileHeader
      />
      <StatsOverview
        totalProfit={totalProfit}
        totalLevelIncome={totalLevelIncome}
        totalMatrixIncome={totalMatrixIncome}
        totalDirectIncome={totalDirectIncome}
      />
      <YesfuturePrograms
        totalLevelIncome={totalLevelIncome}
        totalMatrixIncome={totalMatrixIncome}
        totalDirectIncome={totalDirectIncome}
      />
      <RankProgressCard />
      <RecentActivety />
    </div>
  );
}
