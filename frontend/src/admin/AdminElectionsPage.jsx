import React, { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input, Label } from "../components/Input";
import { useToast } from "../state/toast";
import { useWallet } from "../state/wallet";
import { formatDuration } from "../lib/format";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";


export function AdminElectionsPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const toast = useToast();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  /* ---------------- CREATE ELECTION ---------------- */

  const handleCreate = async () => {
    const start = startAt
      ? Math.floor(new Date(startAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 60;

    const end = endsAt
      ? Math.floor(new Date(endsAt).getTime() / 1000)
      : start + 86400;

    if (!title.trim()) {
      toast.push({ kind: "error", title: "Title required" });
      return;
    }

    if (end <= start) {
      toast.push({ kind: "error", title: "End time must be after start time" });
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/election/create-election", {
        title: title.trim(),
        startTime: start,
        endTime: end
      });

      toast.push({
        kind: "success",
        title: "Election created",
        message: res.data.message
      });

      setTitle("");
      setStartAt("");
      setEndsAt("");
      setShowCreate(false);

      await fetchElections(); // 🔥 reload list
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

  /* ---------------- STATUS HELPER ---------------- */

  const getStatus = (e) => {
    const now = Math.floor(Date.now() / 1000);

    if (now < e.startTime) return "Draft";
    if (now >= e.startTime && now <= e.endTime) return "Active";
    return "Closed";
  };

  /* ---------------- RENDER ---------------- */

  return (

    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-200">
            Manage Elections
          </h1>
          <p className="text-sm text-slate-400">
            Create and monitor elections
          </p>
        </div>

        <Button
          onClick={() => setShowCreate((x) => !x)}
          className="bg-amber-500 hover:bg-amber-400"
        >
          {showCreate ? "Cancel" : "Create Election"}
        </Button>
      </div>

      {/* CREATE FORM */}

      {showCreate && (
        <Card>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>

            <div>
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </Card>
      )}

      {/* ELECTION LIST */}

      {loading ? (
        <Card>Loading elections...</Card>
      ) : elections.length === 0 ? (
        <Card>No elections found</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {elections.map((e) => {


            const now = Math.floor(Date.now() / 1000);
            const status =
            now < e.startTime
            ? "Draft"
            : now >= e.startTime && now <= e.endTime
            ? "Active"
            : "Closed";
            
            const remaining = e.endTime - now;
            
            return (
              <Card key={e.id} className="space-y-4">
      <div className="flex justify-between">
        <div>
          <div className="text-lg font-bold">{e.title}</div>
          <div className="text-xs text-slate-400">
            {e.candidateCount} candidates
          </div>
        </div>

        <Badge
          tone={
            status === "Draft"
              ? "warning"
              : status === "Active"
              ? "success"
              : "neutral"
          }
        >
          {status}
        </Badge>
      </div>

      {status === "Active" && remaining > 0 && (
        <div className="text-sm text-slate-300">
          Time remaining: {formatDuration(remaining)}
        </div>
      )}
      {/* 🔥 ADD CANDIDATE BUTTON ONLY FOR DRAFT */}
      {status === "Draft" && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/elections/${e.id}/candidates`)}
          >
            Add Candidate
          </Button>
        </div>
      )}
    </Card>
  );
})}

        </div>
      )}
    </div>
  );
}
