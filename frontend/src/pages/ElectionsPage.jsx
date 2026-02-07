import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { getElections } from "../lib/electionStore";
import { formatDuration } from "../lib/format";
import { isVerified } from "../lib/storage";
import { useWallet } from "../state/wallet";

export function ElectionsPage() {
  const wallet = useWallet();
  const verified = isVerified(wallet.address);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  const items = useMemo(() => {
    return getElections().map((e) => {
      const remainingMs = e.endsAt - now;
      const isActive = e.status === "Active" && remainingMs > 0;
      return { ...e, remainingMs, isActive };
    });
  }, [now]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Elections</h1>
          <div className="mt-1 text-sm text-slate-300">Browse available elections and vote securely.</div>
        </div>
        <div className="flex items-center gap-2">
          {wallet.status === "connected" ? (
            verified ? (
              <Badge tone="success">Verified</Badge>
            ) : (
              <Badge tone="warning">Not verified</Badge>
            )
          ) : (
            <Badge tone="warning">Wallet not connected</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((e) => (
          <Card key={e.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{e.name}</div>
                <div className="mt-1 text-xs text-slate-400">{e.candidates.length} candidates</div>
              </div>
              {e.isActive ? <Badge tone="success">Active</Badge> : <Badge>Closed</Badge>}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              {e.isActive ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-300">Time remaining</div>
                  <div className="font-semibold">{formatDuration(e.remainingMs)}</div>
                </div>
              ) : (
                <div className="text-slate-300">Election has ended. View results.</div>
              )}
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              {e.isActive ? (
                <Link to={`/elections/${e.id}/vote`}>
                  <Button>View & Vote</Button>
                </Link>
              ) : (
                <Link to={`/elections/${e.id}/results`}>
                  <Button variant="secondary">View Results</Button>
                </Link>
              )}
              <Link to={`/elections/${e.id}/results`}>
                <Button variant="ghost">Results</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="text-xs text-slate-300">
        <div className="font-semibold text-slate-200">Demo behavior</div>
        <div className="mt-1">
          Votes are stored locally for now (per browser). When you connect a contract, this page can be updated to
          fetch on-chain data.
        </div>
      </Card>
    </div>
  );
}
