import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input, Label } from "../components/Input";
import {
  getElections,
  createElection,
  startElection,
  endElection
} from "../lib/electionStore";
import { useToast } from "../state/toast";
import { useWallet } from "../state/wallet";
import { formatDuration } from "../lib/format";
import api from "../lib/api";

export function AdminElectionsPage() {
  const wallet = useWallet();
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const elections = useMemo(() => getElections(true), [tick]);
  const now = Date.now();

  const handleCreate = async () => {
  const start = startAt
    ? Math.floor(new Date(startAt).getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 60;

  const end = endsAt
    ? Math.floor(new Date(endsAt).getTime() / 1000)
    : start + 86400;

  if (!name.trim()) {
    toast.push({ kind: "error", title: "Name required" });
    return;
  }

  if (end <= start) {
    toast.push({ kind: "error", title: "End time must be after start time" });
    return;
  }

  try {
    setSubmitting(true);

    const res = await api.post("/election/create-election", {
      title: name.trim(),
      startTime: start,
      endTime: end
    });

    toast.push({
      kind: "success",
      title: "Election created",
      message: res.data.message
    });

    setName("");
    setDescription("");
    setStartAt("");
    setEndsAt("");
    setShowCreate(false);

  } catch (e) {
    toast.push({
      kind: "error",
      title: "Failed",
      message: e.response?.data?.message || "Error creating election"
    });
  } finally {
    setSubmitting(false);
  }
};


  const handleStart = (id) => {
    startElection(id);
    toast.push({ kind: "success", title: "Election started" });
    setTick((x) => x + 1);
  };

  const handleEnd = (id) => {
    endElection(id);
    toast.push({ kind: "success", title: "Election ended" });
    setTick((x) => x + 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-amber-200">Manage Elections</h1>
          <p className="mt-1 text-sm text-slate-400">Create, start, and end elections. Add candidates when status is Draft.</p>
        </div>
        <Button
          variant="primary"
          className="bg-amber-500 hover:bg-amber-400"
          onClick={() => setShowCreate((x) => !x)}
        >
          {showCreate ? "Cancel" : "Create election"}
        </Button>
      </div>

      {showCreate && (
        <Card className="border-amber-500/20">
          <h2 className="text-lg font-bold text-slate-200">New election</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Election name" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div>
              <Label>Start time (optional)</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div>
              <Label>End time</Label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              className="bg-amber-500 hover:bg-amber-400"
              onClick={() => void handleCreate()}
              disabled={submitting}
            >
              {submitting ? "Creating…" : "Create"}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {elections.map((e) => {
          const remaining = e.endsAt - now;
          const isActive = e.status === "Active" && remaining > 0;
          return (
            <Card key={e.id} className="flex flex-col gap-4 border-amber-500/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-200">{e.name}</div>
                  {e.description ? (
                    <div className="mt-1 text-sm text-slate-400">{e.description}</div>
                  ) : null}
                  <div className="mt-1 text-xs text-slate-500">
                    {e.candidates.length} candidate{e.candidates.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <Badge
                  tone={
                    e.status === "Draft" ? "warning" : e.status === "Active" ? "success" : "neutral"
                  }
                >
                  {e.status}
                </Badge>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                {e.status === "Active" && remaining > 0 ? (
                  <span>Time remaining: {formatDuration(remaining)}</span>
                ) : e.status === "Closed" ? (
                  <span>Ended</span>
                ) : (
                  <span>Not started</span>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {e.status === "Draft" && (
                  <>
                    <Link to={`/admin/elections/${e.id}/candidates`}>
                      <Button variant="secondary" size="sm">
                        Add candidates
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400"
                      onClick={() => handleStart(e.id)}
                    >
                      Start election
                    </Button>
                  </>
                )}
                {e.status === "Active" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEnd(e.id)}
                  >
                    End election
                  </Button>
                )}
                <Link to={`/admin/results?election=${e.id}`}>
                  <Button variant="ghost" size="sm">
                    Results
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {elections.length === 0 && (
        <Card className="border-amber-500/10 text-center text-slate-400">
          No elections yet. Create one to get started.
        </Card>
      )}
    </div>
  );
}
