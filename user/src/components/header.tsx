import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Users,
  UserCheck,
  Link2,
  Banknote,
  Layers3,
  type LucideIcon,
  Gem,
  GitBranch,
  Briefcase,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { checkTeamMembership, verifySponsorId } from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";

interface NavSubItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  items?: NavSubItem[];
  badge?: string;
}

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
      {
        to: "/magic-gold-matrix",
        label: "Magic Gold Matrix",
        icon: Gem,
      },
      {
        to: "/sponsor-magic",
        label: "Sponsor Magic",
        icon: GitBranch,
      },
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
  //       icon: ChartNoAxesColumnIncreasing, // Multiple levels
  //     },
  //   ],
  // },
  { to: "/package-purchase", label: "Purchase Package", icon: Banknote },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // kaunsa group (Team / Income / Information) khula hai — label ko key bana kr track kr rahe hain
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Team: true,
  });
  const [isCheckingId, setIsCheckingId] = useState(false);
  const { address } = useWallet();

  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();

  const handlePreviewIdSearch = async () => {
    const trimmedId = searchId.trim();

    if (!trimmedId) return;

    setIsCheckingId(true);

    try {
      const isValid = await verifySponsorId(trimmedId);

      if (!isValid) {
        toast.error("Not a valid sponsor ID");
        return;
      }

      if (!address) {
        toast.error("Wallet not connected");
        return;
      }

      const teamCheck = await checkTeamMembership(address, trimmedId);
      if (!teamCheck.valid) {
        toast.error("You can only view user IDs within your team.", {
          id: "preview-team-membership-invalid",
        });
        setSearchId("")
        return; // stay exactly where the user currently is, no navigation
      }

      navigate({
        to: "/preview/dashboard",
        search: {
          id: trimmedId,
        },
      });
    } catch (error) {
      toast.error("Something went wrong while checking sponsor ID");
    } finally {
      setIsCheckingId(false);
    }
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <header className="w-full bg-[#4169FF] text-white p-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            className="flex items-center gap-2 font-bold text-xl tracking-wider"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <img src="/logo.png" alt="Logo" className="h-16" />
          </div>
          <div className="lg:flex hidden items-center gap-3 ml-5">
            <h2 className="text-md font-semibold">Preview ID</h2>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="Enter ID"
              className="p-3 rounded-lg text-md font-semibold text-white bg-white/10 focus:outline-none "
            />
            <button
              onClick={handlePreviewIdSearch}
              disabled={isCheckingId}
              className="bg-black text-white py-3 px-4 text-md font-semibold rounded-lg hover:bg-black/70 transition-colors"
            >
              {isCheckingId ? "Checking..." : "Go"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FULLSCREEN NAVBAR / OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#4169FF] text-white flex flex-col overflow-y-auto lg:hidden p-4">
          {/* Top Bar: Logo & Close Button */}
          <div className="flex items-center justify-between pb-4">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12"
              onClick={() => {
                navigate({ to: "/dashboard" });
                setIsMobileMenuOpen(false);
              }}
            />

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col lg:hidden items-start gap-3 mb-3">
            <h2 className="text-xl font-semibold">Preview ID</h2>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter ID"
                className="p-3 flex-1 rounded-lg text-md font-semibold text-white bg-white/10 focus:outline-none "
              />
              <button
                onClick={handlePreviewIdSearch}
                disabled={isCheckingId}
                className="bg-black text-white py-3 px-4 text-md font-semibold rounded-lg hover:bg-black/70 transition-colors"
              >
                {isCheckingId ? "Checking..." : "Go"}
              </button>
            </div>
          </div>

          {/* Sidebar Items Menu List */}
          <div className="flex flex-col space-y-1 divide-y divide-white/10">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              // Simple link — koi nested items nahi hain (e.g. Dashboard)
              if (!item.items) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-2 hover:bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/80" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#2ed573] text-xs font-bold text-black px-2.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // Collapsible group — Team / Income / Information
              const isOpen = !!openGroups[item.label];

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="w-full flex items-center justify-between py-3 px-2 hover:bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/80" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 space-y-1 py-1">
                      {item.items.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <a
                            key={sub.to}
                            href={sub.to}
                            className="flex items-center gap-3 py-2 px-2 text-white/90 hover:bg-white/10 rounded-lg"
                          >
                            <SubIcon className="w-4 h-4 text-white/70" />
                            <span className="text-sm">{sub.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
