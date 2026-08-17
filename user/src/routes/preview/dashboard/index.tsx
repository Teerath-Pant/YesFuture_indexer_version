import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  fetchIncomeStats,
  PreviewModeApiCall,
} from "@/lib/auth-api";
import { Loader2 } from "lucide-react";
import { PreviewUserProfileHeader } from "@/components/preview/dashboard/profile-header";
import { PreviewYesfuturePrograms } from "@/components/preview/dashboard/yesfuture-programs";
import { PreviewUserStatsOverview } from "@/components/preview/dashboard/stats-overview";

export const Route = createFileRoute("/preview/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(true);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalLevelIncome, setTotalLevelIncome] = useState<number>(0);
  const [totalMatrixIncome, setTotalMatrixIncome] = useState<number>(0);

  const [totalDirectIncome, setTotalDirectIncome] = useState<number>(0);
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const incomeData = await PreviewModeApiCall(id, fetchIncomeStats);
        if (isMounted && incomeData) {
          setTotalProfit(parseFloat(incomeData.totalIncome) || 0);
          setTotalLevelIncome(parseFloat(incomeData.totalMagicLevelIncome) || 0);
          setTotalMatrixIncome(parseFloat(incomeData.totalMagicGoldMatrixIncome) || 0);
          setTotalDirectIncome(parseFloat(incomeData.totalSponsorIncome) || 0);
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
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <PreviewUserProfileHeader />

      <PreviewUserStatsOverview
        userId={id}
        totalProfit={totalProfit}
        totalLevelIncome={totalLevelIncome}
        totalMatrixIncome={totalMatrixIncome}
        totalDirectIncome={totalDirectIncome}
      />

      <PreviewYesfuturePrograms
        totalLevelIncome={totalLevelIncome}
        totalMatrixIncome={totalMatrixIncome}
        totalDirectIncome={totalDirectIncome}
      />
    </div>
  );
}
