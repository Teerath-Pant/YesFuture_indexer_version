import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import type { SlotType } from "@/components/matrix-level-card-x-four";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CopyToClipBoard = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address);
    toast.success("copied!");
    return true;
  } catch (error) {
    toast.error("Failed to copy to clipboard:");
    return false;
  }
};

const ROW_SLOT_COUNTS = [2, 4, 8, 16];

export function normalizeTree(tree: SlotType[][]): SlotType[][] {
  return ROW_SLOT_COUNTS.map((expectedCount, rowIdx) => {
    const row = tree[rowIdx] ?? []; // row missing ho to khali array
    const padded = [...row];

    // jitne slots kam hai utne "empty" se bhar do
    while (padded.length < expectedCount) {
      padded.push("empty");
    }

    // agar kisi wajah se zyada aa gaye ho to trim kr do
    return padded.slice(0, expectedCount);
  });
}


export const formatLabel = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};