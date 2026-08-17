import { useCallback, useEffect, useState } from "react";
import {
  connectBrowserWallet,
  getConnectedAccounts,
  isWalletAvailable,
  onAccountsChanged,
} from "./wallet";

export type WalletErrorCode =
  | "NO_WALLET_FOUND"
  | "NO_ACCOUNT_SELECTED"
  | "REQUEST_REJECTED"
  | "UNKNOWN";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletErrorCode | null>(null);

  useEffect(() => {
    if (!isWalletAvailable()) return;
    getConnectedAccounts().then((accounts) => {
      if (accounts.length > 0) setAddress(accounts[0]);
    });
  }, []);

  // user ne MetaMask me account switch/disconnect kiya to state sync rahe
  useEffect(() => {
    return onAccountsChanged((accounts) => {
      setAddress(accounts[0] ?? null);
    });
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const wallet = await connectBrowserWallet();
      setAddress(wallet.address);
      return wallet.address;
    } catch (err) {
      const code = err instanceof Error ? (err.message as WalletErrorCode) : "UNKNOWN";
      setError(
        ["NO_WALLET_FOUND", "NO_ACCOUNT_SELECTED", "REQUEST_REJECTED"].includes(code)
          ? code
          : "UNKNOWN"
      );
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {

    setAddress(null);
    setError(null);
  }, []);

  return { address, isConnecting, error, connect, disconnect };
}

/** Wallet error code ko user-friendly Hinglish message me convert karta hai */
export function walletErrorMessage(code: WalletErrorCode): string {
  switch (code) {
    case "NO_WALLET_FOUND":
      return "No wallet found. Install a browser wallet like MetaMask.";
    case "NO_ACCOUNT_SELECTED":
      return "No account has been selected.";
    case "REQUEST_REJECTED":
      return "The connection request was rejected.";
    default:
      return "Wallet could not be connected; please try again.";
  }
}
