import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input, Label } from "../components/Input";
import { getElectionByIdAdmin, addCandidate } from "../lib/electionStore";
import { useToast } from "../state/toast";

export function AdminCandidatesPage() {
  const { electionId } = useParams();
  const toast = useToast();
  const election = electionId ? getElectionByIdAdmin(electionId) : undefined;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  if (!election) {
    return (
      <Card className="border-amber-500/10">
        <div className="text-lg font-bold text-slate-200">Election not found</div>
        <Link to="/admin/elections" className="mt-4 inline-block">
          <Button variant="secondary">Back to elections</Button>
        </Link>
      </Card>
    );
  }

  const canAdd = election.status === "Draft";

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.push({ kind: "error", title: "Please select an image file (e.g. JPG, PNG)" });
        return;
      }
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.push({ kind: "error", title: "Candidate name required" });
      return;
    }
    if (!imageFile) {
      toast.push({ kind: "error", title: "Candidate image is required" });
      return;
    }
    if (!canAdd) {
      toast.push({ kind: "error", title: "Cannot add candidates after election is active" });
      return;
    }
    try {
      setSubmitting(true);
      await addCandidate(election.id, { name: name.trim(), description: description.trim() || undefined, imageFile });
      toast.push({ kind: "success", title: "Candidate added" });
      setName("");
      setDescription("");
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    } catch (e) {
      toast.push({ kind: "error", title: "Failed", message: e?.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/elections" className="text-sm text-slate-400 hover:text-amber-200">
            ← Elections
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-amber-200">
            Candidates: {election.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Add candidates only when election is Draft. After starting, no more candidates can be added.
          </p>
        </div>
        <Badge tone={election.status === "Draft" ? "warning" : "neutral"}>{election.status}</Badge>
      </div>

      {canAdd && (
        <Card className="border-amber-500/20">
          <h2 className="text-lg font-bold text-slate-200">Add candidate</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Candidate name" />
            </div>
            <div>
              <Label>Party / description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Party or short description"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Candidate image (required)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-200 hover:file:bg-amber-500/30"
              />
              {imagePreview ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-400">Preview:</span>
                  <img
                    src={imagePreview}
                    alt="Candidate preview"
                    className="h-20 w-20 rounded-xl object-cover border border-white/10"
                  />
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400">Upload a photo (JPG, PNG, etc.). Stored on backend when VITE_API_URL is set.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              className="bg-amber-500 hover:bg-amber-400"
              onClick={handleAdd}
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add candidate"}
            </Button>
          </div>
        </Card>
      )}

      {!canAdd && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          This election is {election.status}. Candidates cannot be added or removed.
        </div>
      )}

      <Card className="border-amber-500/10">
        <h2 className="text-lg font-bold text-slate-200">Current candidates ({election.candidates.length})</h2>
        <ul className="mt-4 space-y-3">
          {election.candidates.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
            >
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
                <div className="font-semibold text-slate-200">{c.name}</div>
                {c.description ? (
                  <div className="text-sm text-slate-400">{c.description}</div>
                ) : null}
              </div>
              <Badge>ID: {c.id}</Badge>
            </li>
          ))}
        </ul>
        {election.candidates.length === 0 && (
          <div className="mt-4 text-sm text-slate-400">No candidates yet.</div>
        )}
      </Card>

      <div className="flex gap-2">
        <Link to="/admin/elections">
          <Button variant="secondary">Back to elections</Button>
        </Link>
        <Link to={`/admin/results?election=${election.id}`}>
          <Button variant="ghost">View results</Button>
        </Link>
      </div>
    </div>
  );
}
