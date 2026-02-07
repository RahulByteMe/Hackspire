import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useWallet } from "../state/wallet";
import { isAdmin } from "../config/admin";
import { shortAddress } from "../lib/format";

export function AdminLoginPage() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const denied = state?.denied ?? false;
  const from = state?.from ?? "/admin/dashboard";

  const admin = wallet.status === "connected" && wallet.address && isAdmin(wallet.address);

  useEffect(() => {
    if (admin) navigate(from, { replace: true });
  }, [admin, from, navigate]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card className="border-amber-500/20 bg-slate-900/50">
        <h1 className="text-2xl font-extrabold tracking-tight text-amber-200">Admin Panel</h1>
        <p className="mt-2 text-sm text-slate-300">
          Connect with an admin wallet to manage elections, candidates, and results. Only pre-defined admin
          addresses can access this panel.
        </p>

        {!wallet.isMetaMaskInstalled ? (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            MetaMask is required.{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Install MetaMask
            </a>
          </div>
        ) : wallet.status !== "connected" ? (
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => void wallet.connect()}
              disabled={wallet.status === "connecting"}
              className="w-full bg-amber-500 hover:bg-amber-400"
            >
              {wallet.status === "connecting" ? "Connecting…" : "Connect Wallet"}
            </Button>
          </div>
        ) : denied ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <strong>Access denied.</strong> The connected wallet ({shortAddress(wallet.address)}) is not an
              admin. Only pre-defined admin addresses can access the admin panel.
            </div>
            <p className="text-xs text-slate-400">
              To add an admin: set <code className="rounded bg-white/10 px-1">VITE_ADMIN_ADDRESSES</code> in{" "}
              <code className="rounded bg-white/10 px-1">.env</code> (comma-separated) or add your address in{" "}
              <code className="rounded bg-white/10 px-1">src/config/admin.js</code>.
            </p>
            <Button variant="secondary" onClick={() => void wallet.connect()}>
              Switch wallet
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="text-center">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">
          ← Back to user app
        </Link>
      </div>
    </div>
  );
}
