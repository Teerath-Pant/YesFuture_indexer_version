import { useEffect, useState } from "react";
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
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
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
  { to: "/preview/dashboard", label: "Dashboard", icon: LayoutGrid },
  {
    label: "Team",
    icon: Users,
    items: [
      { to: "/preview/partners", label: "Partners", icon: UserCheck },
      { to: "/preview/team", label: "Teams", icon: Briefcase },
      { to: "/preview/links", label: "Referrals Link", icon: Link2 },
    ],
  },
  {
    label: "Income",
    icon: Banknote,
    items: [
      {
        to: "/preview/magic-gold-matrix",
        label: "Magic Gold Matrix",
        icon: Gem,
      },
      {
        to: "/preview/sponsor-magic",
        label: "Sponsor Magic",
        icon: GitBranch,
      },
      { to: "/preview/magic-level", label: "Magic Level", icon: Layers3 },
    ],
  },
];

export const PreviewHeader = () => {
  const { id } = useSearch({ from: "/preview" });
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");
  const [isGoButtonDisabled, setIsGoButtonDisabled] = useState(true);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const { address } = useWallet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Team: true,
  });

  useEffect(() => {
    setSearchId(id || "");
  }, [id]);

  useEffect(() => {
    if (searchId.trim() === "" || searchId.trim() === id) {
      setIsGoButtonDisabled(true);
    } else {
      setIsGoButtonDisabled(false);
    }
  }, [searchId]);

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
        setSearchId(id ?? "")
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
      {/* ================= DESKTOP / BASE HEADER ================= */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 ">
        {/* Left Section: Mobile Toggle + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div
            className="flex items-center gap-2 font-bold text-xl tracking-wider"
            onClick={() =>
              navigate({
                to: "/preview/dashboard",
                search: (prev) => ({ ...prev }),
              })
            }
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
              disabled={isGoButtonDisabled || isCheckingId}
              className="bg-black disabled:bg-white/10 disabled:cursor-not-allowed text-white py-3 px-4 text-md font-semibold rounded-lg hover:bg-black/70 transition-colors"
            >
              {isCheckingId ? "Checking..." : "Go"}
            </button>
          </div>
          <p className="text-sm sm:text-lg lg:hidden font-semibold">
            Preview Id {id}
          </p>
        </div>

        <button
          onClick={() => {
            navigate({
              to: "/dashboard",
            });
          }}
          className="bg-black  hidden sm:block text-white py-3 px-4 text-md font-semibold rounded-lg hover:bg-black/70 transition-colors"
        >
          Exit Preview mode
        </button>
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
                navigate({
                  to: "/preview/dashboard",
                  search: (prev) => ({ ...prev }),
                });
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
                disabled={isGoButtonDisabled || isCheckingId}
                className="bg-black disabled:bg-white/10 disabled:cursor-not-allowed text-white py-3 px-4 text-md font-semibold rounded-lg hover:bg-black/70 transition-colors"
              >
                {isCheckingId ? "Checking..." : "Go"}
              </button>
            </div>
            <button
              onClick={() => {
                navigate({
                  to: "/dashboard",
                });
              }}
              className="w-full text-md font-semibold  py-3 bg-black rounded-lg"
            >
              Exit Preview mode
            </button>
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
                    to={String(item.to)}
                    search={(prev) => ({ ...prev })}
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
                          <Link
                            key={sub.to}
                            to={sub.to}
                            search={(prev) => ({ ...prev })}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-2 px-2 text-white/90 hover:bg-white/10 rounded-lg"
                          >
                            <SubIcon className="w-4 h-4 text-white/70" />
                            <span className="text-sm">{sub.label}</span>
                          </Link>
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
