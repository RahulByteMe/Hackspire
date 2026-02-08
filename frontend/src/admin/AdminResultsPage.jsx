import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { useToast } from "../state/toast";
import api from "../lib/api";

export function AdminResultsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const electionId = searchParams.get("election");

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ALL ELECTIONS ---------------- */

  const fetchElections = async () => {
    try {
      const res = await api.get("/election/get-all-elections");
      setElections(res.data.elections || []);
    } catch (err) {
      toast.push({
        kind: "error",
        title: "Failed to load elections"
      });
    }
  };

  /* ---------------- FETCH RESULTS ---------------- */

  const fetchResults = async (id) => {
    try {
      const res = await api.get(`/result/results/${id}`);
      setSelectedElection(res.data.election);
      setResults(res.data.results || []);
    } catch (err) {
      toast.push({
        kind: "error",
        title: "Failed to load results"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (electionId) {
      fetchResults(electionId);
    }
  }, [electionId]);

  /* ---------------- DERIVED ---------------- */

  const totalVotes = useMemo(() => {
    return results.reduce((sum, r) => sum + r.voteCount, 0);
  }, [results]);

  const winnerId = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((prev, curr) =>
      curr.voteCount > prev.voteCount ? curr : prev
    ).candidateId;
  }, [results]);

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <Card>Loading results...</Card>;
  }

  if (!selectedElection) {
    return (
      <Card>
        <div className="text-lg font-bold">Select an election</div>
      </Card>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isClosed = now > selectedElection.endTime;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-200">
            Results Panel
          </h1>
          <p className="text-sm text-slate-400">
            Real-time blockchain results
          </p>
        </div>
      </div>

      {/* SELECT ELECTION */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {elections.map((e) => (
            <Link key={e.id} to={`/admin/results?election=${e.id}`}>
              <Button
                variant={e.id == electionId ? "primary" : "ghost"}
                className={
                  e.id == electionId
                    ? "bg-amber-500 hover:bg-amber-400"
                    : ""
                }
              >
                {e.title}
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* RESULTS */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-200">
              {selectedElection.title}
            </h2>
            <div className="mt-1 flex gap-2">
              <Badge>{totalVotes} total votes</Badge>
              {isClosed ? (
                <Badge tone="neutral">Closed</Badge>
              ) : (
                <Badge tone="success">Active</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((c) => {
            const pct =
              totalVotes === 0
                ? 0
                : Math.round((c.voteCount / totalVotes) * 100);

            const isWinner = isClosed && winnerId === c.candidateId;

            return (
              <div
                key={c.candidateId}
                className={`rounded-xl border p-4 ${
                  isWinner
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex justify-between">
                  <div className="font-bold text-slate-200">
                    {c.name}
                  </div>
                  {isWinner && (
                    <Badge tone="success">Winner</Badge>
                  )}
                </div>

                <div className="mt-2 text-sm text-slate-300">
                  {c.voteCount} votes ({pct}%)
                </div>

                <div className="mt-2 h-2 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${pct}%` }}
                  />
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

        <Link to={`/elections/${selectedElection.id}/results`}>
          <Button variant="secondary">
            View as user
          </Button>
        </Link>
      </div>
    </div>
  );
}
