import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { getElections, clearAllStoredData } from "../lib/electionStore";
import { getApiBaseUrl, clearAllCandidatesOnBackend } from "../lib/api";
import { useToast } from "../state/toast";

export function AdminDashboardPage() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const [clearing, setClearing] = useState(false);
  const allElections = useMemo(() => getElections(true), [tick]);

  const handleClearAllData = async () => {
    if (!window.confirm("Remove all elections and candidates you added? This will reset to the default demo data and cannot be undone.")) return;
    setClearing(true);
    try {
      if (getApiBaseUrl()) {
        await clearAllCandidatesOnBackend();
      }
      clearAllStoredData();
      toast.push({ kind: "success", title: "All data cleared" });
      window.location.reload();
    } catch (e) {
      toast.push({ kind: "error", title: "Clear failed", message: e?.message });
    } finally {
      setClearing(false);
    }
  };

  const { draft, active, closed } = useMemo(() => {
    const draft = allElections.filter((e) => e.status === "Draft");
    const active = allElections.filter((e) => e.status === "Active");
    const closed = allElections.filter((e) => e.status === "Closed");
    return { draft, active, closed };
  }, [allElections]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-amber-200">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Overview of elections and quick actions.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setTick((x) => x + 1)}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-500/10">
          <div className="text-sm font-semibold text-slate-400">Draft</div>
          <div className="mt-1 text-3xl font-bold text-amber-200">{draft.length}</div>
          <div className="mt-2 text-xs text-slate-400">Elections not yet started</div>
          <Link to="/admin/elections" className="mt-3 inline-block">
            <Button variant="ghost" size="sm">
              Manage →
            </Button>
          </Link>
        </Card>
        <Card className="border-amber-500/10">
          <div className="text-sm font-semibold text-slate-400">Active</div>
          <div className="mt-1 text-3xl font-bold text-emerald-400">{active.length}</div>
          <div className="mt-2 text-xs text-slate-400">Voting in progress</div>
          <Link to="/admin/elections" className="mt-3 inline-block">
            <Button variant="ghost" size="sm">
              Manage →
            </Button>
          </Link>
        </Card>
        <Card className="border-amber-500/10">
          <div className="text-sm font-semibold text-slate-400">Closed</div>
          <div className="mt-1 text-3xl font-bold text-slate-300">{closed.length}</div>
          <div className="mt-2 text-xs text-slate-400">Ended</div>
          <Link to="/admin/results" className="mt-3 inline-block">
            <Button variant="ghost" size="sm">
              Results →
            </Button>
          </Link>
        </Card>
      </div>

      <Card className="border-amber-500/10">
        <h2 className="text-lg font-bold text-slate-200">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/elections">
            <Button variant="primary" className="bg-amber-500 hover:bg-amber-400">
              Manage elections
            </Button>
          </Link>
          <Link to="/admin/results">
            <Button variant="secondary">View results</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">User app (vote)</Button>
          </Link>
        </div>
      </Card>

      <Card className="border-amber-500/10 text-xs text-slate-400">
        <div className="font-semibold text-slate-300">Admin constraints</div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Admin cannot vote or modify votes.</li>
          <li>Admin does not see Aadhaar or OTP data (off-chain verification).</li>
          <li>Blockchain enforces one vote per wallet; results are transparent and auditable.</li>
        </ul>
      </Card>

      <Card className="border-rose-500/10">
        <h2 className="text-lg font-bold text-slate-200">Reset data</h2>
        <p className="mt-1 text-sm text-slate-400">
          Remove all elections and candidates you added. Resets to the default demo data (localStorage and backend).
        </p>
        <Button
          variant="danger"
          size="sm"
          className="mt-3"
          onClick={handleClearAllData}
          disabled={clearing}
        >
          {clearing ? "Clearing…" : "Clear all added data"}
        </Button>
      </Card>
    </div>
  );
}
