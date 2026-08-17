import { useEffect, useState } from "react";
import { Copy, HelpCircle, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/lib/use-wallet";
import { useNavigate } from "@tanstack/react-router";
import {
  fetchDashboardData,
  updateUserName,
} from "@/lib/auth-api";

export function UserProfileHeader() {
  const navigate = useNavigate();
  const { address: connectedWallet, isConnecting } = useWallet();
  const [userName, setUserName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>("");
  const [isSavingName, setIsSavingName] = useState<boolean>(false);

  // State for real data
  const [stringId, setStringId] = useState<string>("...");
  const [_numericId, setNumericId] = useState<string>("...");
  const [invitedById, setInvitedById] = useState<string>("...");
  const [invitedDate, setInvitedDate] = useState<string>("Recent");
  const [personalLink, setPersonalLink] = useState<string>("Generating...");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirect to sign-in if wallet disconnects
  useEffect(() => {
    const checkWallet = setTimeout(() => {
      if (!isConnecting && !connectedWallet) {
        navigate({ to: "/sign-in" });
      }
    }, 500);
    return () => clearTimeout(checkWallet);
  }, [connectedWallet, isConnecting, navigate]);

  // Fetch user data from contract
  useEffect(() => {
    const fetchUserData = async () => {
      if (!connectedWallet) return;

      try {
        setIsLoading(true);

        // Fetch dashboard data first
        const dashboardData = await fetchDashboardData(connectedWallet);

        if (dashboardData) {
          setStringId(dashboardData.stringId);
          setNumericId(dashboardData.numericId);
          setInvitedById(dashboardData.sponsorId);
          setInvitedDate(dashboardData.activationDate);
          setPersonalLink(`yesfuture.live/ref/${dashboardData.stringId}`);
          setUserName(dashboardData.userName);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [connectedWallet]);

  // Handle copy
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const startEditingName = () => {
    setNameDraft(userName);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameDraft("");
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!connectedWallet || trimmed.length < 1 || trimmed.length > 32) {
      toast.error("Name must be 1-32 characters");
      return;
    }
    setIsSavingName(true);
    const saved = await updateUserName(connectedWallet, trimmed);
    setIsSavingName(false);
    if (saved !== null) {
      setUserName(saved);
      setIsEditingName(false);
      toast.success("Name updated!");
    } else {
      toast.error("Failed to update name");
    }
  };

  if (!connectedWallet) return null;

  // Format wallet address
  const formattedWallet = `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-2xl p-2 pt-4 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.75">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1e2330]">
                  <div className="animate-pulse h-16 w-16 rounded-full bg-gray-700" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="animate-pulse h-8 w-32 bg-gray-700 rounded" />
              <div className="animate-pulse h-4 w-48 bg-gray-700 rounded" />
              <div className="animate-pulse h-4 w-40 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Avatar, User Details, and Link */}
      <div className="flex flex-col gap-6 rounded-2xl p-2 pt-4 text-white md:flex-row md:items-center md:justify-between">
        {/* Left Section: Avatar + Details */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.75">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#ffffff]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-400">
                  <img src="/logo.png" alt="Logo" />
                </div>
              </div>
            </div>

            {isEditingName ? (
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-purple-500/40 bg-[#121624] px-2 py-0.5 text-xs shadow-lg text-nowrap">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") cancelEditingName();
                  }}
                  maxLength={32}
                  disabled={isSavingName}
                  className="w-20 bg-transparent text-purple-300 outline-none"
                />
                <button onClick={saveName} disabled={isSavingName} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={cancelEditingName} disabled={isSavingName} className="text-gray-400 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditingName}
                className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-purple-500/40 bg-[#121624] px-3 py-0.5 text-xs font-medium text-purple-300 shadow-lg text-nowrap hover:bg-[#1a1f33]"
                title="Edit name"
              >
                <span>{userName || "Set name"}</span>
                <Pencil className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* User Info Details */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white">
                <span className="rounded-md bg-blue-950/60 border border-blue-800/40 px-1 font-medium text-blue-500 mr-2">
                  ID
                </span>
                {stringId}
              </h1>
              {/* <span className="text-sm font-semibold text-blue-500">ID {numericId}</span> */}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-gray-200">
                {formattedWallet}
              </span>
              <button
                onClick={() => handleCopy(connectedWallet, "Wallet address")}
                className="text-gray-400 transition-colors hover:text-white"
                title="Copy Address"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
              <span>invited {invitedDate} by</span>
              <span className="rounded-full bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 font-medium text-blue-400">
                {invitedById}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Personal Link Card */}
        <div className="flex flex-col h-28 justify-between rounded-xl bg-[#181c28] p-4 md:w-95">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
            <span>Personal link</span>
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer stroke-[#1d1e1f] fill-white" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="truncate font-extrabold text-blue-500 text-sm sm:text-xl">
              {personalLink}
            </span>
            <button
              onClick={() =>
                handleCopy(`https://${personalLink}`, "Personal link")
              }
              className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/20"
            >
              {" "}
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
