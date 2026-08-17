import LinkCardList, { type LinkData } from "@/components/links/link-card";
import LinkPageSkeleton from "@/components/links/link-page-skeleton";
import LinksStats from "@/components/links/link-stats";
import PageLayout from "@/layouts/page-layout";
import {
  fetchDirectPartners,
  fetchDirectPartnersCount,
  fetchIncomeBreakdown,
  fetchPackageAndId,
  fetchTotalTeamSize,
  PreviewModeApiCall,
} from "@/lib/auth-api";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/preview/links")({
  component: RouteComponent,
});

export interface PartnerRow {
  id: number;
  date: string;
  wallet: string;
  fullWallet?: string;
  refId: string;
  x3: number;
  x4: number;
  xXx: number;
  xGold: number;
  xQore: number;
  maxQore: number;
  profitUSDT: string;
  profitBNB: string;
  newPartners: number;
  partners: number;
}

function RouteComponent() {
  const {id} = useSearch({from:"/preview"})
  const [data, setData] = useState<PartnerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProfit, setTotalProfit] = useState<string>("0");
  const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [partnersCount, setPartnersCount] = useState<number>(0);

  useEffect(() => {
    if (!id) {
      setData([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      PreviewModeApiCall(id,fetchDirectPartners),
      PreviewModeApiCall(id,fetchPackageAndId),
      PreviewModeApiCall(id,fetchIncomeBreakdown),
      PreviewModeApiCall(id,fetchTotalTeamSize),
      PreviewModeApiCall(id,fetchDirectPartnersCount),
    ])
      .then(([rows, profile, incomeData, teamSizeData, partnersCountData]) => {
        if (!isMounted) return;
        setData(rows ?? []);
        setTotalProfit(incomeData?.totalProfit || "0");
        setTeamCount(Number(teamSizeData));
        setPartnersCount(Number(partnersCountData));
        setPageId(
          profile?.stringId ||
            (profile?.numericId ? `ID ${profile.numericId}` : undefined),
        );
      })
      .catch((error) => {
        console.error("Failed to load direct partners or profile:", error);
        if (isMounted) setData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const links: LinkData[] = [
    {
      id: 1,
      label: "Personal link",
      url: `yesfuture.live/ref/${pageId}`,
      color: "default",
    },
  ];

  return (
    <PageLayout>
      {isLoading && <LinkPageSkeleton linkCount={links.length || 3} />}
      {!isLoading && (
        <>
          <LinksStats
            id={pageId ?? ""}
            partners={partnersCount}
            team={teamCount}
            profits={{ amount: totalProfit, currency: "USDT" }}
            data={data}
          />
          <LinkCardList links={links} />
        </>
      )}
    </PageLayout>
  );
}
