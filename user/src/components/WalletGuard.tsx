import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWallet } from "@/lib/use-wallet";
import { Loader2 } from "lucide-react";
import { isWalletRegistered } from "@/lib/auth-api";

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { address: connectedWallet, isConnecting } = useWallet();
  const [isChecking, setIsChecking] = useState(true);

  // useEffect(() => {
  //   if (isConnecting) return;

  //   const timer = setTimeout(() => {
  //     if (!connectedWallet) {
  //       // Kick them to sign in if no wallet is found
  //       navigate({ to: "/sign-in" });
  //     } else {
  //       setIsChecking(false);
  //     }
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [connectedWallet, isConnecting, navigate]);

  useEffect(() => {
    if (isConnecting) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;

      const wallet = connectedWallet;

      if (!wallet) {
        // Kick them to sign in if no wallet is found
        navigate({ to: "/sign-in", replace: true });
        return;
      }

      try {
        const isRegistered = await isWalletRegistered(wallet);
        if (cancelled) return;

        if (!isRegistered) {
          navigate({ to: "/sign-in", replace: true });
        } else {
          setIsChecking(false);
        }
      } catch {
        if (!cancelled) {
          navigate({ to: "/sign-in", replace: true });
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [connectedWallet, isConnecting, navigate]);

  if (isChecking || isConnecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0d1117]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}
