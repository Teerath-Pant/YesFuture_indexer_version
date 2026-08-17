export interface ConnectedWallet {
  address: string;
  chainId: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on: (event: string, cb: (...args: any[]) => void) => void;
      removeListener: (event: string, cb: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function isWalletAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}


export async function connectBrowserWallet(): Promise<ConnectedWallet> {
  if (!isWalletAvailable()) {
    throw new Error("NO_WALLET_FOUND");
  }

  try {
    const accounts: string[] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("NO_ACCOUNT_SELECTED");
    }

    const chainId: string = await window.ethereum!.request({ method: "eth_chainId" });

    return { address: accounts[0], chainId };
  } catch (err: any) {
    // EIP-1193: user ne request reject kiya (code 4001)
    if (err?.code === 4001) throw new Error("REQUEST_REJECTED");
    throw err;
  }
}

/** Wallet me currently connected accounts silently check karta hai (bina popup ke) */
export async function getConnectedAccounts(): Promise<string[]> {
  if (!isWalletAvailable()) return [];
  return window.ethereum!.request({ method: "eth_accounts" });
}

/** 0x1234...abcd jaisa short display format */
export function shortenAddress(address: string, chars = 5): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Basic EVM address format validation (checksum nahi, sirf shape) */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/** User ne MetaMask me account switch kiya to callback milega */
export function onAccountsChanged(cb: (accounts: string[]) => void): () => void {
  if (!isWalletAvailable()) return () => {};
  window.ethereum!.on("accountsChanged", cb);
  return () => window.ethereum!.removeListener("accountsChanged", cb);
}

export function onChainChanged(cb: (chainId: string) => void): () => void {
  if (!isWalletAvailable()) return () => {};
  window.ethereum!.on("chainChanged", cb);
  return () => window.ethereum!.removeListener("chainChanged", cb);
}
