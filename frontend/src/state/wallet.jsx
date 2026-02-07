import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAccounts,
  getChainId,
  getEthereum,
  isMetaMaskInstalled,
  requestAccounts,
  SEPOLIA_CHAIN_ID_DEC,
  switchToSepolia
} from "../lib/ethereum";
import { useToast } from "./toast";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const toast = useToast();
  const [status, setStatus] = useState("disconnected");
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const installed = isMetaMaskInstalled();

  const refresh = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      setAddress(null);
      setChainId(null);
      setStatus("disconnected");
      return;
    }
    const [accounts, cid] = await Promise.all([getAccounts(eth), getChainId(eth)]);
    setAddress(accounts[0] ?? null);
    setChainId(cid);
    setStatus(accounts.length ? "connected" : "disconnected");
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      toast.push({
        kind: "error",
        title: "MetaMask not found",
        message: "Install MetaMask to connect your wallet."
      });
      return;
    }
    try {
      setStatus("connecting");
      const accounts = await requestAccounts(eth);
      const cid = await getChainId(eth);
      setAddress(accounts[0] ?? null);
      setChainId(cid);
      setStatus(accounts.length ? "connected" : "disconnected");
      if (accounts.length) toast.push({ kind: "success", title: "Wallet connected" });
    } catch (e) {
      setStatus("disconnected");
      toast.push({
        kind: "error",
        title: "Wallet connection failed",
        message: e?.message ?? "Please try again."
      });
    }
  }, [toast]);

  const requestSepolia = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      await switchToSepolia(eth);
      toast.push({ kind: "success", title: "Switched to Sepolia" });
      await refresh();
    } catch (e) {
      toast.push({
        kind: "error",
        title: "Network switch failed",
        message: e?.message ?? "Please switch to Sepolia in MetaMask."
      });
    }
  }, [refresh, toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth?.on) return;

    const onAccountsChanged = (accounts) => {
      setAddress(accounts[0] ?? null);
      setStatus(accounts.length ? "connected" : "disconnected");
    };
    const onChainChanged = (chainIdHex) => {
      setChainId(Number.parseInt(chainIdHex, 16));
    };

    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      isMetaMaskInstalled: installed,
      address,
      chainId,
      isSepolia: chainId === SEPOLIA_CHAIN_ID_DEC,
      connect,
      requestSepolia,
      refresh
    }),
    [address, chainId, connect, installed, refresh, requestSepolia, status]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
