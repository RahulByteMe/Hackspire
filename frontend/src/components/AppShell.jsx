import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useWallet } from "../state/wallet";
import { shortAddress } from "../lib/format";
import { Button } from "./Button";
import { Badge } from "./Badge";
import logo from "../img/image.png"

export function AppShell() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
  <div className="flex items-center gap-4">
  <img
    src={logo}
    alt="Hackspire Logo"
    className="h-14 w-auto object-contain"
  />

  <div>
    <h1 className="text-2xl font-semibold text-white">Hackspire</h1>
    <p className="text-sm text-gray-400">Hybrid Blockchain Voting</p>
  </div>
</div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <TopNavLink to="/verify" label="Verify" />
            <TopNavLink to="/elections" label="Elections" />
            <Link
              to="/admin"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {wallet.status === "connected" ? (
              <>
                {wallet.isSepolia ? (
                  <Badge tone="success">Sepolia</Badge>
                ) : (
                  <button
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/15"
                    onClick={() => void wallet.requestSepolia()}
                    type="button"
                  >
                    Wrong network • Switch
                  </button>
                )}
                <Badge>{shortAddress(wallet.address)}</Badge>
              </>
            ) : null}

            {!wallet.isMetaMaskInstalled ? (
              <>
                <Badge tone="warning">MetaMask required</Badge>
                <a
                  className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 md:inline-flex"
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Install MetaMask
                </a>
              </>
            ) : wallet.status !== "connected" ? (
              <Button
                variant="primary"
                onClick={() => void wallet.connect()}
                disabled={wallet.status === "connecting"}
              >
                {wallet.status === "connecting" ? "Connecting…" : "Connect Wallet"}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10"><Outlet /></main>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-4 text-xs text-slate-400">
          Aadhaar verification is simulated for hackathon demo purposes. No personal data is stored on-chain.
        </div>
      </footer>
    </div>
  );
}

function TopNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
