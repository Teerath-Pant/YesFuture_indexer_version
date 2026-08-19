// import { useEffect, useState } from "react";
// import { CheckCircle2, Loader2 } from "lucide-react";

// export type RegistrationStep =
//   | "checking"
//   | "validating"
//   | "checking-approval"
//   | "confirm-approve"
//   | "waiting-approve"
//   | "confirm-register"
//   | "waiting-register"
//   | "success";

// interface StepConfig {
//   percent: number;
//   label: string;
// }

// const STEP_CONFIG: Record<Exclude<RegistrationStep, "waiting-approve" | "waiting-register">, StepConfig> = {
//   checking: { percent: 15, label: "Checking wallet & sponsor..." },
//   validating: { percent: 30, label: "Validating balances..." },
//   "checking-approval": { percent: 45, label: "Checking token approval..." },
//   "confirm-approve": { percent: 60, label: "Please confirm transaction in wallet..." },
//   "confirm-register": { percent: 80, label: "Please confirm transaction in wallet..." },
//   success: { percent: 100, label: "Registration Successful!" },
// };

// const WAITING_PERCENT: Record<"waiting-approve" | "waiting-register", number> = {
//   "waiting-approve": 70,
//   "waiting-register": 90,
// };

// const WAITING_LABELS = [
//   "Submitting transaction for verification...",
//   "Waiting for blockchain confirmation...",
// ];

// interface RegistrationOverlayProps {
//   step: RegistrationStep | null;
// }

// export function RegistrationOverlay({ step }: RegistrationOverlayProps) {
//   const [waitingLabelIndex, setWaitingLabelIndex] = useState(0);

//   const isWaitingStep = step === "waiting-approve" || step === "waiting-register";

//   useEffect(() => {
//     if (!isWaitingStep) {
//       setWaitingLabelIndex(0);
//       return;
//     }

//     const interval = setInterval(() => {
//       setWaitingLabelIndex((prev) => (prev + 1) % WAITING_LABELS.length);
//     }, 2500);

//     return () => clearInterval(interval);
//   }, [isWaitingStep, step]);

//   if (!step) return null;

//   const percent = isWaitingStep
//     ? WAITING_PERCENT[step as "waiting-approve" | "waiting-register"]
//     : STEP_CONFIG[step as Exclude<RegistrationStep, "waiting-approve" | "waiting-register">].percent;

//   const label = isWaitingStep
//     ? WAITING_LABELS[waitingLabelIndex]
//     : STEP_CONFIG[step as Exclude<RegistrationStep, "waiting-approve" | "waiting-register">].label;

//   const isSuccess = step === "success";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//       <div className="flex w-full max-w-xs flex-col items-center gap-5 px-6 text-center">
//         {isSuccess ? (
//           <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500">
//             <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.5} />
//           </div>
//         ) : (
//           <Loader2 className="h-16 w-16 animate-spin text-[#f59e0b]" strokeWidth={1.75} />
//         )}

//         <p
//           className={`text-lg font-semibold leading-snug ${
//             isSuccess ? "text-emerald-400" : "text-white"
//           }`}
//         >
//           {label}
//         </p>

//         {isSuccess ? (
//           <p className="text-sm text-gray-400">Redirecting to login...</p>
//         ) : (
//           <>
//             <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
//               <div
//                 className="h-full rounded-full bg-linear-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-500 ease-out"
//                 style={{ width: `${percent}%` }}
//               />
//             </div>
//             <p className="text-xs text-gray-500">Please do not close this window</p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

// "success" is UI-only — the sign-up page sets it manually once registerUser()
// resolves. The real API only ever emits "approving" / "registering".
export type RegistrationStep = "approving" | "registering" | "success";

interface SubPhase {
  label: string;
  percent: number;
}

// Purely cosmetic sub-steps. The real "approving" signal fires once and then
// we just await the tx — this cycles through labels so it doesn't look stuck.
const APPROVING_PHASES: SubPhase[] = [
  { label: "Checking token approval...", percent: 15 },
  { label: "Please confirm transaction in wallet...", percent: 30 },
  { label: "Submitting transaction for verification...", percent: 40 },
  { label: "Waiting for blockchain confirmation...", percent: 45 },
];

const REGISTERING_PHASES: SubPhase[] = [
  { label: "Please confirm transaction in wallet...", percent: 60 },
  { label: "Submitting transaction for verification...", percent: 75 },
  { label: "Waiting for blockchain confirmation...", percent: 90 },
];

const PHASE_INTERVAL_MS = 1800;

interface RegistrationOverlayProps {
  step: RegistrationStep | null;
}

export function RegistrationOverlay({ step }: RegistrationOverlayProps) {
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    setSubIndex(0);

    if (step !== "approving" && step !== "registering") return;

    const phases = step === "approving" ? APPROVING_PHASES : REGISTERING_PHASES;

    const interval = setInterval(() => {
      setSubIndex((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, PHASE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [step]);

  if (!step) return null;

  const isSuccess = step === "success";
  const phases = step === "approving" ? APPROVING_PHASES : REGISTERING_PHASES;
  const current = isSuccess ? null : phases[Math.min(subIndex, phases.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-full max-w-xs flex-col items-center gap-5 px-6 text-center">
        {isSuccess ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500">
            <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <Loader2 className="h-16 w-16 animate-spin text-[#4169FF]" strokeWidth={1.75} />
        )}

        <p
          className={`text-lg font-semibold leading-snug ${
            isSuccess ? "text-emerald-400" : "text-white"
          }`}
        >
          {isSuccess ? "Registration Successful!" : current!.label}
        </p>

        {isSuccess ? (
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        ) : (
          <>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#4169FF] to-[#4e74ff] transition-all duration-500 ease-out"
                style={{ width: `${current!.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">Please do not close this window</p>
          </>
        )}
      </div>
    </div>
  );
}