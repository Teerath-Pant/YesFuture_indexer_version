import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Users,
  UserCheck,
  Link2,
  ChevronDown,
  ChevronUp,
  Banknote,
  Layers3,
  GitBranch,
  Gem,
  ChartNoAxesColumnIncreasing,
  Share2,
  Network,
  Briefcase,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type SingleNavItem = {
  to: string;
  label: string;
  icon: any;
  badge?: string;
};

type GroupNavItem = {
  label: string;
  icon: any;
  items: { to: string; label: string; icon: any }[];
};

type NavItem = SingleNavItem | GroupNavItem;

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  {
    label: "Team",
    icon: Users,
    items: [
      { to: "/partners", label: "Partners", icon: UserCheck },
      { to: "/team", label: "Teams", icon: Briefcase },
      { to: "/links", label: "Referrals Link", icon: Link2 },
      // { to: "/stats", label: "Stats", icon: PieChart },
    ],
  },
  {
    label: "Income",
    icon: Banknote,
    items: [
      { to: "/magic-gold-matrix", label: "Magic Gold Matrix", icon: Gem  },
      { to: "/sponsor-magic", label: "Sponsor Magic", icon: GitBranch },
      { to: "/magic-level", label: "Magic Level", icon: Layers3 },
    ],
  },
  // {
  //   label: "Purchase Package",
  //   icon: Banknote,
  //   items: [
  //     {
  //       to: "/package-purchase/magic-gold-matrix",
  //       label: "Magic Gold Matrix",
  //       icon: Network, // Premium/Gold package
  //     },
  //     {
  //       to: "/package-purchase/sponsor-magic",
  //       label: "Sponsor Magic",
  //       icon: Share2, // Referral/Sponsor network
  //     },
  //     {
  //       to: "/package-purchase/magic-level",
  //       label: "Magic Level",
  //       icon: ChartNoAxesColumnIncreasing , // Multiple levels
  //     },
  //   ],
  // },
  { to: "/package-purchase", label: "Purchase Package", icon: Banknote },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // Image me Team menu expand h, isliye default true rakha h
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Team: true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="flex h-full w-52 mt-2 shrink-0 rounded-lg flex-col bg-[#212123c9] max-h-[calc(100vh-100px)] pl-2 pr-2 text-[#A1A1A6] font-sans">
      <nav className="flex-1 space-y-3 overflow-y-auto pt-3">
        {NAV_ITEMS.map((item) => {
          // Accordion Group Items (Team, Information, etc.)
          if ("items" in item) {
            const isOpen = !!openGroups[item.label];
            const isChildActive = item.items.some((child) => pathname === child.to);
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "rounded-lg transition-all duration-150 overflow-hidden",
                  isOpen || isChildActive ? "bg-[#212123] p-3" : "px-3 py-2"
                )}
              >
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="flex w-full items-center justify-between text-[15px] font-medium text-[#A1A1A6] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-[#8E8E93]" />
                    <span className="text-white font-normal">{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#636366]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#636366]" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-[#2C2C2E]/60 space-y-3 pl-1">
                        {item.items.map((child) => {
                          const active = pathname === child.to;
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={onNavigate}
                              className={cn(
                                "flex items-center gap-3 text-[14px] font-normal transition-colors py-1 px-1 rounded-md",
                                active
                                  ? "text-white font-medium"
                                  : "text-[#A1A1A6] hover:text-white"
                              )}
                            >
                              <ChildIcon className="h-5 w-5 shrink-0 text-[#8E8E93]" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Single Direct Navigation Items
          const active = pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between rounded-md px-4 py-3 text-[15px] font-medium transition-all",
                active
                  ? "bg-[#26262A] text-white shadow-sm"
                  : "text-[#A1A1A6] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-[#8E8E93]" />
                <span className={cn(active ? "text-white font-semibold" : "text-[#A1A1A6]")}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="text-[13px] font-medium text-[#00E676]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}