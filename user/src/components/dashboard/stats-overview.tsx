// import React from "react";
import {
  fetchDashboardStats,
  fetchDashboardToday,
  fetchIncomeToday,
  fetchUserTotalInvested,
  fetchLevelPackageAndIdWithMax,
  fetchMatrixPackageAndIdWithMax,
  fetchSponsorPackageAndIdWithMax,
} from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";
import { useNavigate } from "@tanstack/react-router";
import { Users, Rocket, HelpCircle, ArrowUpRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import ProfitBreakdownCard from "@/components/profit-breakdown-card";
import PackageOverview from "@/components/package-overview";

interface statsProps {
  totalDirectIncome: string;
  totalLevelIncome: string;
  totalMatrixIncome: string;
  totalProfit: string;
}

export function StatsOverview(props: statsProps) {
  const navigate = useNavigate();
  const { address: connectedWallet, isConnecting } = useWallet();

  const [teamCount, setTeamCount] = useState<number>(0);
  const [partnersCount, setPartnersCount] = useState<number>(0);
  const [ratio, setRatio] = useState<number>(0);
  const [teamCountInDay, setTeamCountInDay] = useState<number>(0);
  const [partnersCountInDay, setPartnersCountInDay] = useState<number>(0);
  const [ratioInDay, setRatioInDay] = useState<number>(0);
  const [totalProfitInDay, setTotalProfitInDay] = useState<number>(0);
  const [totalLevelIncomeInDay, setTotalLevelIncomeInDay] = useState<number>(0);
  const [totalMatrixIncomeInDay, setTotalMatrixIncomeInDay] =
    useState<number>(0);

  const [totalDirectIncomeInDay, setTotalDirectIncomeInDay] =
    useState<number>(0);

  const [matrixPackage, setMatrixPackage] = useState({
    pkgId: 1,
    maxPkg: 1,
    numericId: "",
    stringId: "",
    isRoot: false,
  });
  const [levelPackage, setLevelPackage] = useState({
    pkgId: 1,
    maxPkg: 1,
    numericId: "",
    stringId: "",
    isRoot: false,
  });
  const [sponsorPackage, setSponsorPackage] = useState({
    pkgId: 1,
    maxPkg: 1,
    numericId: "",
    stringId: "",
    isRoot: false,
  });

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
        // Team size + direct partners (indexer-maintained running totals)
        const dashboardStats = await fetchDashboardStats(connectedWallet);
        if (isMounted && dashboardStats) {
          setTeamCount(Number(dashboardStats.totalTeam));
          setPartnersCount(Number(dashboardStats.directPartners));
        }

        // Today-joined counts (computed live, not stored)
        const dashboardToday = await fetchDashboardToday(connectedWallet);
        if (isMounted) {
          setTeamCountInDay(Number(dashboardToday.totalTeamJoinedToday));
          setPartnersCountInDay(Number(dashboardToday.todayJoinedDirectPartners));
        }

        // Today income, for the profit-breakdown card's "today" badges
        const incomeToday = await fetchIncomeToday(connectedWallet);
        if (isMounted) {
          setTotalDirectIncomeInDay(Number(incomeToday.todaySponsorIncome));
          setTotalLevelIncomeInDay(Number(incomeToday.todayMagicLevelIncome));
          setTotalMatrixIncomeInDay(Number(incomeToday.todayMagicGoldMatrixIncome));
          setTotalProfitInDay(Number(incomeToday.todayTotalIncome));
        }

        // Ratio card: profit % vs total invested. DB-sourced sum of every
        // package purchase across all 3 tracks, not the on-chain
        // userTotalInvestment (frozen at registration's package-1 price,
        // never updated by later upgrades — was producing 260%+ ratios).
        // No "today" version of investment exists, so today's ratio compares
        // today's income against this same running total.
        const investment = await fetchUserTotalInvested(connectedWallet);
        if (isMounted) {
          const investmentValue = Number(investment) || 0;
          const totalProfitValue = Number(props.totalProfit) || 0;
          const todayProfitValue = Number(incomeToday.todayTotalIncome) || 0;
          setRatio(
            investmentValue > 0
              ? Math.round((totalProfitValue / investmentValue) * 100)
              : 0,
          );
          setRatioInDay(
            investmentValue > 0
              ? Math.round((todayProfitValue / investmentValue) * 100)
              : 0,
          );
        }

        const matrixPackageData =
          await fetchMatrixPackageAndIdWithMax(connectedWallet);
        if (isMounted && matrixPackageData) {
          setMatrixPackage({
            pkgId: matrixPackageData.pkgId,
            maxPkg: matrixPackageData.maxPkg,
            numericId: matrixPackageData.numericId,
            stringId: matrixPackageData.stringId,
            isRoot: matrixPackageData.isRoot,
          });
        }

        // Level package + id with max
        const levelPackageData =
          await fetchLevelPackageAndIdWithMax(connectedWallet);
        if (isMounted && levelPackageData) {
          setLevelPackage({
            pkgId: levelPackageData.pkgId,
            maxPkg: levelPackageData.maxPkg,
            numericId: levelPackageData.numericId,
            stringId: levelPackageData.stringId,
            isRoot: levelPackageData.isRoot,
          });
        }

        // Sponsor package + id with max
        const sponsorPackageData =
          await fetchSponsorPackageAndIdWithMax(connectedWallet);
        if (isMounted && sponsorPackageData) {
          setSponsorPackage({
            pkgId: sponsorPackageData.pkgId,
            maxPkg: sponsorPackageData.maxPkg,
            numericId: sponsorPackageData.numericId,
            stringId: sponsorPackageData.stringId,
            isRoot: sponsorPackageData.isRoot,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [connectedWallet, props.totalProfit]);

  return (
    <div className="flex flex-col gap-4 text-white py-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Card 1: Partners */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#212123c9] p-5 border border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span>Partners</span>
              <HelpCircle className="h-4 w-4" />
            </div>
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-end">
            <div className="mt-6 text-2xl font-bold tracking-tight text-white">
              {partnersCount}
            </div>
            <span className="text-sm flex items-center gap-0.5 font-medium text-emerald-400">
              {partnersCountInDay}<User size={14}/>
            </span>
          </div>
        </div>

        {/* Card 2: Team */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#212123c9] p-5 border border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span>Team</span>
              <HelpCircle className="h-4 w-4" />
            </div>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-end">
            <div className="mt-6 text-2xl font-bold tracking-tight text-white">
              {teamCount}
            </div>
            <span className="text-sm flex items-center gap-0.5 font-medium text-emerald-400">
              {teamCountInDay}<Users size={14}/>
            </span>
          </div>
        </div>

        {/* Card 3: Ratio (profit % vs total investment) */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#212123c9] p-5 border border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span>Ratio</span>
              <HelpCircle className="h-4 w-4" />
            </div>
            <Rocket className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-end">
            <div className="mt-6 text-2xl font-bold tracking-tight text-white">
              {ratio} %
            </div>
            <span className="text-sm font-medium text-emerald-400">
              {ratioInDay} %
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="">
          <ProfitBreakdownCard
            showBuyPurchase={false}
            totalProfit={props.totalProfit}
            totalProfitInDay={totalProfitInDay}
            levelIncome={props.totalLevelIncome}
            levelIncomeInDay={totalLevelIncomeInDay}
            matrixIncome={props.totalMatrixIncome}
            matrixIncomeInDay={totalMatrixIncomeInDay}
            sponsorIncome={props.totalDirectIncome}
            sponsorIncomeInDay={totalDirectIncomeInDay}
          />
        </div>
        <div className="relative overflow-hidden w-full rounded-2xl bg-linear-to-r from-[#212123c9] to-[#5e4c3a] p-5 border border-white/5">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Top 100 leaders</span>
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                navigate({ to: "/leaderboard" });
              }}
              className="rounded-xl bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-white/20"
            >
              See Now
            </button>
          </div>
          <img
            src="/crown.png"
            alt="crown"
            className="absolute h-40 sm:h-50 -rotate-12 -bottom-10 sm:-bottom-15 -right-10 sm:-right-12 text-5xl pointer-events-none select-none opacity-80"
          />
          {/* <div className="absolute -bottom-2 -right-2 text-5xl pointer-events-none select-none opacity-80">
          </div> */}
        </div>
      </div>
      <PackageOverview
        isPreviewMode={false}
        magicLevelPurchased={levelPackage.pkgId}
        magicGoldMatrixPurchased={matrixPackage.pkgId}
        sponsorMagicPurchased={sponsorPackage.pkgId}
      />
      {/* <RankProgressCard currentValue={partnersCount} /> */}
    </div>
  );
}
