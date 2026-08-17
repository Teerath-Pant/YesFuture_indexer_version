import { ChevronDown } from "lucide-react";
import { type PackageCardData } from "./package-card-selector";

interface PackageSelectTriggerProps {
  selectedPackage?: PackageCardData;
  onClick: () => void;
}

export default function PackageSelectTrigger({ selectedPackage, onClick }: PackageSelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between bg-[#181822] rounded-xl px-4 py-3.5 text-left"
    >
      <span className={selectedPackage ? "text-white font-medium" : "text-gray-500"}>
        {selectedPackage ? `${selectedPackage.label} — ${selectedPackage.amount}` : "Select package"}
      </span>
      <ChevronDown size={18} className="text-gray-500" />
    </button>
  );
}