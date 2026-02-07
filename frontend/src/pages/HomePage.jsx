import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useWallet } from "../state/wallet";
import { isVerified } from "../lib/storage";
import { Badge } from "../components/Badge";

export function HomePage() {
  const wallet = useWallet();
  const verified = isVerified(wallet.address);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-indigo-300/10" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Badge>Hackathon Demo</Badge>
            <Badge tone="success">Transparent</Badge>
            <Badge tone="warning">Identity: off-chain</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            Vote on-chain, verify off-chain — simple for users, auditable for everyone.
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Connect your wallet, complete Aadhaar-based (mock) verification, and cast a vote. Results update in
            real-time (demo storage).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {wallet.status !== "connected" ? (
              <Button onClick={() => void wallet.connect()} disabled={!wallet.isMetaMaskInstalled}>
                Connect MetaMask
              </Button>
            ) : !wallet.isSepolia ? (
              <Button onClick={() => void wallet.requestSepolia()} variant="secondary">
                Switch to Sepolia
              </Button>
            ) : !verified ? (
              <Link to="/verify">
                <Button>Verify Identity</Button>
              </Link>
            ) : (
              <Link to="/elections">
                <Button>Go to Elections</Button>
              </Link>
            )}
            <Link to="/elections">
              <Button variant="ghost">Browse Elections</Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Quick Status</h2>
        <div className="mt-4 space-y-3 text-sm">
          <Row label="Wallet">
            {wallet.status === "connected" ? (
              <Badge tone="success">Connected</Badge>
            ) : (
              <Badge tone="warning">Not connected</Badge>
            )}
          </Row>
          <Row label="Network">
            {wallet.status !== "connected" ? (
              <Badge>—</Badge>
            ) : wallet.isSepolia ? (
              <Badge tone="success">Sepolia</Badge>
            ) : (
              <Badge tone="danger">Wrong network</Badge>
            )}
          </Row>
          <Row label="Verification">
            {verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>}
          </Row>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <div className="font-semibold text-slate-200">Privacy note</div>
          <div className="mt-1">
            Aadhaar is <span className="font-semibold">not</span> stored on-chain. In this demo, verification is
            simulated and stored locally.
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-300">{label}</div>
      <div>{children}</div>
    </div>
  );
}
