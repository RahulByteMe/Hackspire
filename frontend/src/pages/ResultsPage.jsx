import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { getElectionById } from "../lib/electionStore";
import { getVotesForElection } from "../lib/storage";

export function ResultsPage() {
  const { electionId } = useParams();
  const election = electionId ? getElectionById(electionId) : undefined;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 10_000);
    return () => window.clearInterval(t);
  }, []);

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

  if (!election) {
    return (
      <Card>
        <div className="text-lg font-bold">Election not found</div>
        <div className="mt-4">
          <Link to="/elections">
            <Button>Back to Elections</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Results</h1>
          <div className="mt-1 text-sm text-slate-300">{election.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{total} total votes</Badge>
          <Button variant="secondary" onClick={() => setTick((x) => x + 1)}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {election.candidates.map((c) => {
          const n = counts.get(c.id) ?? 0;
          const pct = total === 0 ? 0 : Math.round((n / total) * 100);
          const isWinner = winnerId === c.id && total > 0;
          return (
            <Card key={c.id} className={isWinner ? "border-emerald-500/30 bg-emerald-500/10" : ""}>
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
                      <div className="text-lg font-bold">{c.name}</div>
                      {c.description ? <div className="mt-1 text-sm text-slate-300">{c.description}</div> : null}
                    </div>
                    {isWinner ? <Badge tone="success">Winner</Badge> : <Badge>Candidate</Badge>}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-300">Votes</div>
                  <div className="font-semibold">
                    {n} <span className="text-slate-400">({pct}%)</span>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-brand-500"
                    style={{ width: `${pct}%` }}
                    aria-label={`${pct}%`}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={`/elections/${election.id}/vote`}>
          <Button>Go to voting page</Button>
        </Link>
        <Link to="/elections">
          <Button variant="ghost">Back to Elections</Button>
        </Link>
      </div>
    </div>
  );
}
