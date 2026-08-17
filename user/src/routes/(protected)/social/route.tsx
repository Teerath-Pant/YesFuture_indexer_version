import ProfileHeader from "@/components/social/profile-header";
import ProfileStats from "@/components/social/profile-stats";
import RankBadges, { type RankBadge } from "@/components/social/rank-badges";
import PageLayout from "@/layouts/page-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/social")({
  component: Social,
});

function Social() {
  const badges: RankBadge[] = [
    { id: 1, label: "10K", color: "#8b8fce" },
    { id: 2, label: "500", color: "#c0c0c8" },
    { id: 3, label: "100", color: "#22d3ee" },
    { id: 4, label: "", locked: true },
  ];
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* banner + stats same row me overlap ke liye relative wrapper */}
        <div className="relative">
          <ProfileHeader username="9610741058" id="206248" />
          <div className="absolute right-0 top-[230px]">
            <ProfileStats
              partners={10666}
              team={2701}
              ratio={629}
              profits={[
                { amount: 34671.7, currency: "BUSD" },
                { amount: 0, currency: "BNB" },
              ]}
            />
          </div>
        </div>

        <RankBadges badges={badges} onShowAll={() => console.log("show all")} />
      </div>
    </PageLayout>
  );
}
