import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Label } from "../components/Input";
import { getElections, getElectionByIdAdmin, finalizeElection } from "../lib/electionStore";
import { getVotesForElection } from "../lib/storage";
import { useToast } from "../state/toast";

export function AdminResultsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const electionIdParam = searchParams.get("election");
  const [tick, setTick] = useState(0);

  const elections = useMemo(() => getElections(true), [tick]);
  const election = electionIdParam
    ? getElectionByIdAdmin(electionIdParam)
    : elections.find((e) => e.status === "Closed" || e.status === "Active") ?? elections[0];

  const { total, counts, winnerId } = useMemo(() => {
    if (!election) return { total: 0, counts: new Map(), winnerId: null };
    const votes = getVotesForElection(election.id);
    const m = new Map();
    for (const v of votes) m.set(v.candidateId, (m.get(v.candidateId) ?? 0) + 1);
    const totalVotes = votes.length;
    let topId = null;
    let top = -1;
    for (const c of election.candidates) {
      const n = m.get(c.id) ?? 0;
      if (n > top) {
        top = n;
        topId = c.id;
      }
    }
    return { total: totalVotes, counts: m, winnerId: topId };
  }, [election, tick]);

  const handleFinalize = () => {
    if (!election) return;
    if (election.status !== "Closed") {
      toast.push({ kind: "error", title: "Election must be closed before finalizing" });
      return;
    }
    finalizeElection(election.id, winnerId);
    toast.push({ kind: "success", title: "Results finalized" });
    setTick((x) => x + 1);
  };

  if (!election) {
    return (
      <Card className="border-amber-500/10">
        <div className="text-lg font-bold text-slate-200">No elections</div>
        <Link to="/admin/elections" className="mt-4 inline-block">
          <Button variant="secondary">Create election</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-amber-200">Results Panel</h1>
          <p className="mt-1 text-sm text-slate-400">
            View real-time results. Finalize after election is closed to lock the winner.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setTick((x) => x + 1)}>
          Refresh
        </Button>
      </div>

      <Card className="border-amber-500/10">
        <Label>Select election</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {elections.map((e) => (
            <Link key={e.id} to={`/admin/results?election=${e.id}`}>
              <Button
                variant={e.id === election.id ? "primary" : "ghost"}
                size="sm"
                className={e.id === election.id ? "bg-amber-500 hover:bg-amber-400" : ""}
              >
                {e.name}
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="border-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-200">{election.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={election.status === "Active" ? "success" : "neutral"}>{election.status}</Badge>
              <Badge>{total} total votes</Badge>
              {election.finalized && (
                <Badge tone="success">Finalized</Badge>
              )}
            </div>
          </div>
          {election.status === "Closed" && !election.finalized && (
            <Button
              variant="primary"
              className="bg-amber-500 hover:bg-amber-400"
              onClick={handleFinalize}
            >
              Finalize results
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {election.candidates.map((c) => {
            const n = counts.get(c.id) ?? 0;
            const pct = total === 0 ? 0 : Math.round((n / total) * 100);
            const isWinner =
              (election.finalized && election.winnerId === c.id) || (winnerId === c.id && total > 0);
            return (
              <div
                key={c.id}
                className={`rounded-xl border p-4 ${
                  isWinner ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {(c.imageUrl || c.imageData) ? (
                    <img
                      src={c.imageUrl || c.imageData}
                      alt={c.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-white/10"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-slate-400">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-200">{c.name}</div>
                        {c.description ? (
                          <div className="text-sm text-slate-400">{c.description}</div>
                        ) : null}
                      </div>
                      {isWinner ? <Badge tone="success">Winner</Badge> : <Badge>Candidate</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Votes</span>
                    <span className="font-semibold text-slate-200">
                      {n} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${pct}%` }}
                      aria-label={`${pct}%`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-2">
        <Link to="/admin/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <Link to={`/elections/${election.id}/results`}>
          <Button variant="secondary">View as user (public results)</Button>
        </Link>
      </div>
    </div>
  );
}
