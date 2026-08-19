import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Wallet, Plug, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useWallet, walletErrorMessage } from "@/lib/use-wallet";
import {
  verifySponsorId,
  registerUser,
  isWalletRegistered,
} from "@/lib/auth-api";

import {
  RegistrationOverlay,
  type RegistrationStep,
} from "@/components/registration-overlay";

import {
  AuthShell,
  Field,
  inputClasses,
  primaryButtonClasses,
  linkButtonClasses,
} from "../../lib/auth-shell";
import { RootID } from "@/constants/programs";

export const Route = createFileRoute("/(auth)/sign-up")({
  validateSearch: (search) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const {
    address: connectedWallet,
    isConnecting,
    error: walletError,
    connect,
  } = useWallet();

  // Sponsor ID state
  const [sponsorIdInput, setSponsorIdInput] = useState("");
  const [isSponsorValid, setIsSponsorValid] = useState(false);
  const [isResolvingSponsor, setIsResolvingSponsor] = useState(false);
  const [sponsorNotFound, setSponsorNotFound] = useState(false);

  // Name state
  const [nameInput, setNameInput] = useState("");

  // Registration check state
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);

  // Transaction states
  // const [txStatus, setTxStatus] = useState<"idle" | "approving" | "registering">("idle");
  // const [registerError, setRegisterError] = useState<string | null>(null);

  const [registrationStep, setRegistrationStep] =
    useState<RegistrationStep | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) return;

    setSponsorIdInput(ref);

    navigate({
      to: "/sign-up",
      replace: true,
      search: { ref: undefined },
    });
  }, [ref, navigate]);

  // 1. Validate Sponsor ID when typing
  useEffect(() => {
    setIsSponsorValid(false);
    setSponsorNotFound(false);

    if (sponsorIdInput.length < 3) return;
    let isCancelled = false;

    setIsResolvingSponsor(true);
    const timer = setTimeout(async () => {
      try {
        const isValid = await verifySponsorId(sponsorIdInput);
        if (isCancelled) return;
        setIsResolvingSponsor(false);

        if (isValid) {
          setIsSponsorValid(true);
        } else {
          setSponsorNotFound(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setIsResolvingSponsor(false);
          setSponsorNotFound(true);
        }
      }
    }, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [sponsorIdInput]);

  // 2. Check if connected wallet is already registered
  useEffect(() => {
    if (!connectedWallet) {
      setIsAlreadyRegistered(false);
      return;
    }

    setIsCheckingWallet(true);
    isWalletRegistered(connectedWallet).then((registered) => {
      setIsAlreadyRegistered(registered);
      setIsCheckingWallet(false);
    });
  }, [connectedWallet]);

  const canRegister = Boolean(
    isSponsorValid &&
    connectedWallet &&
    nameInput.trim().length > 0 &&
    !isAlreadyRegistered &&
    !isCheckingWallet &&
    registrationStep === null,
  );
  const handleRegister = async () => {
    if (!canRegister || !connectedWallet) return;

    setRegisterError(null);
    try {
      await registerUser(sponsorIdInput, nameInput.trim(), (status) => {
        setRegistrationStep(status as RegistrationStep);
      });

      setRegistrationStep("success");
      setTimeout(() => {
        navigate({ to: "/sign-in" });
      }, 1400);
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationStep(null);
      if (error.code === "ACTION_REJECTED") {
        setRegisterError("Transaction rejected by user in wallet.");
      } else if (error.message) {
        setRegisterError(error.message);
      } else {
        setRegisterError(
          "Registration failed. Make sure you have 75 USDT and gas fees.",
        );
      }
    }
  };

  // const handleRegister = async () => {
  //   if (!canRegister || !connectedWallet) return;

  //   setRegisterError(null);
  //   try {
  //     await registerUser(sponsorIdInput, nameInput.trim(), (status) => {
  //       setRegistrationStep(status as RegistrationStep);
  //     });

  //     navigate({ to: "/sign-in" });
  //   } catch (error: any) {
  //     console.error("Registration error:", error);
  //     if (error.code === "ACTION_REJECTED") {
  //       setRegisterError("Transaction rejected by user in wallet.");
  //     } else if (error.message) {
  //       setRegisterError(error.message);
  //     } else {
  //       setRegisterError(
  //         "Registration failed. Make sure you have 75 USDT and gas fees.",
  //       );
  //     }
  //   } finally {
  //     setRegistrationStep(null);
  //   }
  // };

  // const canRegister = Boolean(
  //   isSponsorValid &&
  //   connectedWallet &&
  //   nameInput.trim().length > 0 &&
  //   !isAlreadyRegistered &&
  //   !isCheckingWallet &&
  //   txStatus === "idle",
  // );

  // const handleRegister = async () => {
  //   if (!canRegister || !connectedWallet) return;

  //   setRegisterError(null);
  //   try {
  //     await registerUser(sponsorIdInput, nameInput.trim(), (status) => {
  //       setTxStatus(status as "approving" | "registering");
  //     });

  //     navigate({ to: "/sign-in" });
  //   } catch (error: any) {
  //     console.error("Registration error:", error);
  //     if (error.code === "ACTION_REJECTED") {
  //       setRegisterError("Transaction rejected by user in wallet.");
  //     } else if (error.message) {
  //       setRegisterError(error.message);
  //     } else {
  //       setRegisterError(
  //         "Registration failed. Make sure you have 75 USDT and gas fees.",
  //       );
  //     }
  //   } finally {
  //     setTxStatus("idle");
  //   }
  // };

  return (
    <AuthShell
      title="Create account"
      subtitle="Enter your sponsor ID to register"
    >
      <RegistrationOverlay step={registrationStep} />
      <Field label="SPONSOR ID *">
        <input
          value={sponsorIdInput}
          onChange={(e) =>
            setSponsorIdInput(e.target.value.trim().toUpperCase())
          }
          placeholder={RootID}
          spellCheck={false}
          className={inputClasses}
        />
      </Field>

      <div className="min-h-5 -mt-2 px-1">
        {isResolvingSponsor && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying Sponsor
            ID...
          </span>
        )}
        {!isResolvingSponsor && isSponsorValid && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sponsor ID Confirmed
          </span>
        )}
        {!isResolvingSponsor &&
          sponsorNotFound &&
          sponsorIdInput.length >= 3 && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> Invalid Sponsor ID
            </span>
          )}
      </div>

      <Field label="YOUR NAME *">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          spellCheck={false}
          maxLength={32}
          className={inputClasses}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          YOUR WALLET ADDRESS <span className="text-red-500">*</span>
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
            className={`w-full bg-[#0d1117] border ${isAlreadyRegistered ? "border-red-900" : "border-gray-800"} text-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm font-mono cursor-not-allowed placeholder:text-gray-600 focus:outline-none`}
          />
        </div>

        {isCheckingWallet && (
          <p className="flex items-center gap-1.5 text-xs text-gray-400 px-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking wallet
            status...
          </p>
        )}
        {isAlreadyRegistered && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 px-1 font-medium">
            <AlertCircle className="h-3.5 w-3.5" /> Already registered wallet
            address.
          </p>
        )}

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

      {/* <button
        type="button"
        onClick={handleRegister}
        disabled={!canRegister}
        className={primaryButtonClasses}
      >
        {txStatus === "approving" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Approving 75 USDT...
          </>
        )}
        {txStatus === "registering" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Confirming
            Registration...
          </>
        )}
        {txStatus === "idle" && "Register"}
      </button> */}
      <button
        type="button"
        onClick={handleRegister}
        disabled={!canRegister}
        className={primaryButtonClasses}
      >
        Register
      </button>

      {registerError && (
        <p className="text-center text-xs text-red-400">{registerError}</p>
      )}

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate({ to: "/sign-in" })}
          className={linkButtonClasses}
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}
