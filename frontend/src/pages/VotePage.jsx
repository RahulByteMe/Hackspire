import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { getElectionById } from "../lib/electionStore";
import { randomHex } from "../lib/format";
import { hasVoted, isVerified, storeVote } from "../lib/storage";
import { useToast } from "../state/toast";
import { useWallet } from "../state/wallet";

export function VotePage() {
  const { electionId } = useParams();
  const election = electionId ? getElectionById(electionId) : undefined;
  const wallet = useWallet();
  const toast = useToast();

  const verified = isVerified(wallet.address);
  const alreadyVoted = election ? hasVoted(election.id, wallet.address) : false;
  const [submitting, setSubmitting] = useState(null);

  const isActive = useMemo(() => {
    if (!election) return false;
    return election.status === "Active" && election.endsAt > Date.now();
  }, [election]);

  if (!election) {
    return (
      <Card>
        <div className="text-lg font-bold">Election not found</div>
        <div className="mt-2 text-sm text-slate-300">Please go back to the elections dashboard.</div>
        <div className="mt-4">
          <Link to="/elections">
            <Button>Back to Elections</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const votingDisabled =
    wallet.status !== "connected" || !wallet.isSepolia || !verified || alreadyVoted || !isActive || submitting !== null;

  const reason = (() => {
    if (wallet.status !== "connected") return "Connect your wallet to vote.";
    if (!wallet.isSepolia) return "Switch to Sepolia to vote.";
    if (!verified) return "Verify identity before voting.";
    if (!isActive) return "Election is closed.";
    if (alreadyVoted) return "You have already voted.";
    return null;
  })();

  async function castVote(candidateId) {
    if (!election || !wallet.address) return;
    if (votingDisabled) return;

    const ok = window.confirm("Confirm your vote? This action cannot be undone (demo).");
    if (!ok) return;

    try {
      setSubmitting(candidateId);
      toast.push({ title: "Submitting vote…", message: "In production this would open MetaMask.", kind: "info" });

      await new Promise((r) => setTimeout(r, 1200));
      const txHash = `0x${randomHex(32)}`;

      storeVote({
        electionId: election.id,
        voter: wallet.address.toLowerCase(),
        candidateId,
        txHash,
        timestamp: Date.now()
      });

      toast.push({ kind: "success", title: "Vote recorded", message: `Tx: ${txHash.slice(0, 12)}…` });
    } catch (e) {
      toast.push({ kind: "error", title: "Vote failed", message: e?.message ?? "Please try again." });
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{election.name}</h1>
          <div className="mt-1 text-sm text-slate-300">Choose one candidate and submit your vote.</div>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? <Badge tone="success">Active</Badge> : <Badge>Closed</Badge>}
          {verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>}
          {alreadyVoted ? <Badge tone="danger">Voted</Badge> : <Badge>Not voted</Badge>}
        </div>
      </div>

      {!verified ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-300">
            You must verify identity (mock) before voting.
          </div>
          <Link to="/verify">
            <Button>Verify now</Button>
          </Link>
        </Card>
      ) : null}

      {!wallet.isSepolia && wallet.status === "connected" ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-300">Wrong network. Please switch to Sepolia testnet.</div>
          <Button onClick={() => void wallet.requestSepolia()} variant="secondary">
            Switch to Sepolia
          </Button>
        </Card>
      ) : null}

      {reason ? <div className="text-sm text-slate-400">{reason}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {election.candidates.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="flex gap-4">
              {(c.imageUrl || c.imageData) ? (
                <img
                  src={c.imageUrl || c.imageData}
                  alt={c.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover border border-white/10"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl font-bold text-slate-400">
                  {c.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold">{c.name}</div>
                {c.description ? <div className="mt-1 text-sm text-slate-300">{c.description}</div> : null}
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3">
              <Link to={`/elections/${election.id}/results`} className="text-xs font-semibold text-slate-300 hover:text-white">
                View results
              </Link>
              <Button
                onClick={() => void castVote(c.id)}
                disabled={votingDisabled}
                variant={alreadyVoted ? "secondary" : "primary"}
              >
                {submitting === c.id ? "Submitting…" : "Vote"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
