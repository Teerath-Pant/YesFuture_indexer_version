import { formatAmount } from "@/lib/helper";
import { Link } from "@tanstack/react-router";
import { Coins, TrendingUp, Layers, Users } from "lucide-react";

interface ProfitBreakdownCardProps {
  showBuyPurchase?: boolean;
  totalProfit: string | number;
  totalProfitInDay: string | number;
  levelIncome: string | number;
  levelIncomeInDay: string | number;
  matrixIncome: string | number;
  matrixIncomeInDay: string | number;
  sponsorIncome: string | number;
  sponsorIncomeInDay: string | number;
}

// function formatAmount(value: string | number) {
//   const num = typeof value === "string" ? parseFloat(value) : value;
//   if (Number.isNaN(num)) return "0.00";
//   return num.toLocaleString(undefined, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 4,
//   });
// }

export default function ProfitBreakdownCard({
  showBuyPurchase=false,
  totalProfit,
  totalProfitInDay,
  levelIncome,
  levelIncomeInDay,
  matrixIncome,
  matrixIncomeInDay,
  sponsorIncome,
  sponsorIncomeInDay,
}: ProfitBreakdownCardProps) {


  const items = [
    {
      key: "level",
      label: "Magic level income",
      value: levelIncome,
      inDayValue: levelIncomeInDay,
      icon: Layers,
      color: "text-blue-400 bg-blue-500/20",
      navigate:"/package-purchase/magic-level"
    },
    {
      key: "matrix",
      label: "Magic gold matrix income",
      value: matrixIncome,
      inDayValue: matrixIncomeInDay,
      icon: TrendingUp,
      color: "text-amber-500 bg-amber-500/20",
      navigate:"/package-purchase/magic-gold-matrix"
    },
    {
      key: "sponsor",
      label: "Sponsor income",
      value: sponsorIncome,
      inDayValue: sponsorIncomeInDay,
      icon: Users,
      color: "text-emerald-400 bg-emerald-500/20",
      navigate:"/package-purchase/sponser-magic"
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-[#212123c9] p-6 border border-white/5">
      <div className="flex items-center justify-between text-sm font-medium text-gray-300">
        <span>Profit</span>
        <Coins className="h-5 w-5 text-gray-400" />
      </div>

      {/* Total profit */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between">
        <span className="text-xs font-medium text-nowrap text-gray-400">Total profit</span>
        <div className="mt-1 w-full sm:w-fit justify-between sm:items-end flex items-center self-end gap-1">
          <span className="text-3xl font-bold tracking-tight text-white">
            ${formatAmount(totalProfit)}
          </span>
          <span className="text-emerald-400 self-end">
            ${formatAmount(totalProfitInDay)}
          </span>
          {/* <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
            $
          </span> */}
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {items.map(({ key, label, value, inDayValue, icon: Icon, color,navigate }) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row lg:flex-col items-start justify-between rounded-xl bg-[#292930] p-4 lg:p-3 gap-2"
          >
            <div className="flex flex-row px-1 lg:w-full items-center gap-2">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-gray-200 ">
                {label}
              </span>
            </div>
            <div className="flex justify-between w-full sm:w-fit lg:w-full gap-1">
              <span className="flex w-full items-center gap-1.5 lg:mt-2 lg:px-1">
                <span className="text-lg font-bold ml-5 text-white">
                  $ {formatAmount(value)}
                </span>
                {/* <span className="text-xs font-medium text-gray-500">USDT</span> */}
              </span>
              <span className="text-emerald-400 self-end">
                ${formatAmount(inDayValue)}
              </span>
            </div>
            {showBuyPurchase && (
              <Link
              to={navigate}
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-white/20 w-full text-center"
              >
              Buy Package
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
