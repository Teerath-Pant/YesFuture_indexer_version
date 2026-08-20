import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

// The real buy functions (buyMatrixPackage/buyLevelPackage/buySponsorPackage)
// only ever emit "approving" / "purchasing". "success" is UI-only, set
// manually by the page once the whole pending-purchase loop finishes.
export type PurchaseStep = "approving" | "purchasing" | "success";

interface SubPhase {
  label: string;
  percent: number;
}

const APPROVING_PHASES: SubPhase[] = [
  { label: "Checking token approval...", percent: 15 },
  { label: "Please confirm transaction in wallet...", percent: 30 },
  { label: "Submitting transaction for verification...", percent: 40 },
  { label: "Waiting for blockchain confirmation...", percent: 45 },
];

const PURCHASING_PHASES: SubPhase[] = [
  { label: "Please confirm transaction in wallet...", percent: 60 },
  { label: "Submitting transaction for verification...", percent: 75 },
  { label: "Waiting for blockchain confirmation...", percent: 90 },
];

const PHASE_INTERVAL_MS = 1800;

export interface PurchaseContext {
  /** e.g. "Magic Gold Matrix" */
  programLabel: string;
  /** package tier currently being bought, e.g. 3 */
  tier: number;
  /** 1-based index of this purchase within the whole run */
  index: number;
  /** total number of purchases in this run */
  total: number;
}

interface PurchaseOverlayProps {
  step: PurchaseStep | null;
  context: PurchaseContext | null;
}

export function PurchaseOverlay({ step, context }: PurchaseOverlayProps) {
  const [subIndex, setSubIndex] = useState(0);

  // Reset the fake sub-progression whenever the real step OR the
  // program/tier being processed changes — otherwise switching from
  // "Matrix Pkg 2" to "Matrix Pkg 3" would keep showing a stale phase.
  useEffect(() => {
    setSubIndex(0);

    if (step !== "approving" && step !== "purchasing") return;

    const phases = step === "approving" ? APPROVING_PHASES : PURCHASING_PHASES;

    const interval = setInterval(() => {
      setSubIndex((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, PHASE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [step, context?.programLabel, context?.tier]);

  if (!step) return null;

  const isSuccess = step === "success";
  const phases = step === "approving" ? APPROVING_PHASES : PURCHASING_PHASES;
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

        {!isSuccess && context && (
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            {context.programLabel} — Package {context.tier}
            {context.total > 1 && ` (${context.index} of ${context.total})`}
          </p>
        )}

        <p
          className={`text-lg font-semibold leading-snug ${
            isSuccess ? "text-emerald-400" : "text-white"
          }`}
        >
          {isSuccess ? "Purchase Successful!" : current!.label}
        </p>

        {isSuccess ? (
          <p className="text-sm text-gray-400">Updating your packages...</p>
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