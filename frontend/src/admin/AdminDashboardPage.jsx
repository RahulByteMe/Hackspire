import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { useToast } from "../state/toast";
import api from "../lib/api";

export function AdminDashboardPage() {
  const toast = useToast();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  /* ---------------- FETCH ELECTIONS ---------------- */

  const fetchElections = async () => {
    try {
      const res = await api.get("/election/get-all-elections");
      setElections(res.data.elections || []);
    } catch (err) {
      toast.push({
        kind: "error",
        title: "Failed to load elections"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  /* ---------------- STATUS COUNTS ---------------- */

  const { draft, active, closed } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);

    const draft = [];
    const active = [];
    const closed = [];

    elections.forEach((e) => {
      if (now < e.startTime) draft.push(e);
      else if (now >= e.startTime && now <= e.endTime) active.push(e);
      else closed.push(e);
    });

    return { draft, active, closed };
  }, [elections]);

  /* ---------------- RESET (OPTIONAL BACKEND CALL) ---------------- */

  const handleClearAllData = async () => {
    if (
      !window.confirm(
        "This will remove ALL elections from backend and blockchain. Continue?"
      )
    )
      return;

    try {
      setClearing(true);

      await api.delete("/admin/clear-all"); // create this endpoint if needed

      toast.push({
        kind: "success",
        title: "All data cleared"
      });

      await fetchElections();
    } catch (err) {
      toast.push({
        kind: "error",
        title: "Reset failed",
        message: err.response?.data?.message || "Error"
      });
    } finally {
      setClearing(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-200">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Overview of elections and system status.
          </p>
        </div>
      </div>

      {loading ? (
        <Card>Loading...</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-slate-400">Draft</div>
            <div className="text-3xl font-bold text-amber-200">
              {draft.length}
            </div>
          </Card>

          <Card>
            <div className="text-sm text-slate-400">Active</div>
            <div className="text-3xl font-bold text-emerald-400">
              {active.length}
            </div>
          </Card>

          <Card>
            <div className="text-sm text-slate-400">Closed</div>
            <div className="text-3xl font-bold text-slate-300">
              {closed.length}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h2 className="text-lg font-bold text-slate-200">Quick Links</h2>
        <div className="mt-4 flex gap-3 flex-wrap">
          <Link to="/admin/elections">
            <Button>Manage Elections</Button>
          </Link>

          <Link to="/admin/results">
            <Button variant="secondary">View Results</Button>
          </Link>

          <Link to="/">
            <Button variant="ghost">User App</Button>
          </Link>
        </div>
      </Card>

      <Card className="border-rose-500/20">
        <h2 className="text-lg font-bold text-slate-200">Reset System</h2>
        <p className="text-sm text-slate-400">
          This will delete all elections from backend.
        </p>

        <Button
          variant="danger"
          className="mt-3"
          onClick={handleClearAllData}
          disabled={clearing}
        >
          {clearing ? "Clearing..." : "Clear All Elections"}
        </Button>
      </Card>
    </div>
  );
}
