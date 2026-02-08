import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useToast } from "../state/toast";
import { useWallet } from "../state/wallet";
import api from "../lib/api";
import { isVerified } from "../lib/storage";

export function VotePage() {
  const { electionId } = useParams();
  const wallet = useWallet();
  const toast = useToast();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const verified = isVerified(wallet.address);

  /* ---------------- FETCH ELECTION ---------------- */

  useEffect(() => {
    async function fetchElection() {
      try {
        const res = await api.get(
          `/election/get-election/${Number(electionId)}`
        );

        setElection(res.data.election);
        setCandidates(res.data.candidates || []);
        setAlreadyVoted(res.data.alreadyVoted || false);
      } catch (err) {
        console.error(err);
        setElection(null);
      } finally {
        setLoading(false);
      }
    }

    if (electionId) {
      fetchElection();
    }
  }, [electionId]);

  /* ---------------- STATUS ---------------- */

  const isActive = useMemo(() => {
    if (!election) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= election.startTime && now <= election.endTime;
  }, [election]);

  const votingDisabled =
    wallet.status !== "connected" ||
    !wallet.isSepolia ||
    !verified ||
    alreadyVoted ||
    !isActive ||
    submitting !== null;

  /* ---------------- CAST VOTE ---------------- */

  async function castVote(candidateId) {
    if (votingDisabled) return;

    const ok = window.confirm(
      "Confirm your vote? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setSubmitting(candidateId);

      const res = await api.post("/vote/cast-vote", {
        electionId: Number(electionId),
        candidateId,
        voter: wallet.address
      });

      toast.push({
        kind: "success",
        title: "Vote submitted",
        message: res.data.message
      });

      setAlreadyVoted(true);
    } catch (err) {
      toast.push({
        kind: "error",
        title: "Vote failed",
        message: err.response?.data?.message || "Error submitting vote"
      });
    } finally {
      setSubmitting(null);
    }
  }

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <Card>Loading election...</Card>;
  }

  if (!election) {
    return (
      <Card>
        <div className="text-lg font-bold">Election not found</div>
        <Link to="/elections">
          <Button className="mt-4">Back to Elections</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{election.title}</h1>
        </div>

        <div className="flex gap-2">
          <Badge tone={isActive ? "success" : "neutral"}>
            {isActive ? "Active" : "Closed"}
          </Badge>
          <Badge tone={verified ? "success" : "warning"}>
            {verified ? "Verified" : "Not verified"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((c) => (
          <Card key={c.id} className="flex justify-between items-center">
            <div className="font-bold">{c.name}</div>

            <Button
              onClick={() => castVote(c.id)}
              disabled={votingDisabled}
            >
              {submitting === c.id ? "Submitting..." : "Vote"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
