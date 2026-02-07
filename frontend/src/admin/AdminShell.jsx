import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useWallet } from "../state/wallet";
import { shortAddress } from "../lib/format";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";

export function AdminShell({ children }) {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600" />
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide text-amber-200">Hackspire Admin</div>
                <div className="text-xs text-slate-400">Election authority</div>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <AdminNavLink to="/admin/dashboard" label="Dashboard" />
              <AdminNavLink to="/admin/elections" label="Elections" />
              <AdminNavLink to="/admin/results" label="Results" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {wallet.status === "connected" && (
              <Badge tone="warning">{shortAddress(wallet.address)}</Badge>
            )}
            <Link to="/">
              <Button variant="ghost" size="sm">
                ← User app
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-amber-500/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs text-slate-400">
          Admin cannot vote, modify votes, or access voter identity (Aadhaar/OTP). Results are transparent and
          auditable.
        </div>
      </footer>
    </div>
  );
}

function AdminNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-amber-500/20 text-amber-200"
            : "text-slate-400 hover:bg-amber-500/10 hover:text-amber-100"
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
