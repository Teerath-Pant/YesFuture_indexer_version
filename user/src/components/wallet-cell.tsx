import React, { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";

export interface WalletCellProps {
  address: string;
  displayAddress?: string;
  explorerUrl?: string;
  /** Hide the copy/explorer-link buttons, just show the address text. Default true. */
  showActions?: boolean;
}

export default function WalletCell({ address, displayAddress, explorerUrl, showActions = true }: WalletCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (explorerUrl) window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <span>{displayAddress ?? address}</span>

      {showActions && (
        <button
          onClick={handleCopy}
          title="Copy address"
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      )}

      {showActions && explorerUrl && (
        <button
          onClick={handleRedirect}
          title="View on explorer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink size={14} />
        </button>
      )}
    </div>
  );
}