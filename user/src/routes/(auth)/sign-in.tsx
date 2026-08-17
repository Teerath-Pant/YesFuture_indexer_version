import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Plug, Loader2, AlertCircle } from "lucide-react";
import { useWallet, walletErrorMessage } from "@/lib/use-wallet";
import { signInUser } from "@/lib/auth-api";

import {
  AuthShell,
  primaryButtonClasses,
  linkButtonClasses,
} from "../../lib/auth-shell";

export const Route = createFileRoute("/(auth)/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const {
    address: connectedWallet,
    isConnecting,
    error: walletError,
    connect,
  } = useWallet();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const canSignIn = Boolean(connectedWallet && !isSigningIn);

  const handleSignIn = async () => {
    if (!canSignIn || !connectedWallet) return;

    setSignInError(null);
    setIsSigningIn(true);

    try {
      // Calls the blockchain to verify the user exists
      await signInUser(connectedWallet);

      // If it passes, redirect to dashboard
      navigate({ to: "/dashboard", search: {} });
    } catch (error: any) {
      console.error("Sign In Crash Details:", error);
      setSignInError(error.message || "sign in failed. please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="connect your wallet to sign in">
      {/* Wallet Input & Button Styled like your Sign Up page */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          YOUR WALLET ADDRESS
        </label>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Wallet className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={connectedWallet || ""}
            placeholder="Auto-detected from Web3 Wallet"
            disabled
            readOnly
            className="w-full bg-[#0d1117] border border-gray-800 text-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm font-mono cursor-not-allowed placeholder:text-gray-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-start pt-1">
          <button
            type="button"
            onClick={connect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#18130c] hover:bg-[#221b10] text-[#f59e0b] border border-[#b45309]/50 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b]" />
            ) : (
              <Plug className="h-3.5 w-3.5 text-[#f59e0b]" />
            )}
            <span>
              {connectedWallet ? "Re-detect Wallet" : "Detect Wallet"}
            </span>
          </button>
        </div>
      </div>

      {walletError && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 px-1">
          <AlertCircle className="h-3.5 w-3.5" />{" "}
          {walletErrorMessage(walletError)}
        </p>
      )}

      <button
        type="button"
        onClick={handleSignIn}
        disabled={!canSignIn}
        className={primaryButtonClasses}
      >
        {isSigningIn ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {signInError && (
        <p className="text-center text-xs text-red-400">{signInError}</p>
      )}

      <p className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/sign-up",
              search: {
                ref: undefined,
              },
            })
          }
          className={linkButtonClasses}
        >
          Sign up
        </button>
      </p>
    </AuthShell>
  );
}
