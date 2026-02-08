import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { formatDuration } from "../lib/format";
import { isVerified } from "../lib/storage";
import { useWallet } from "../state/wallet";
import api from "../lib/api";

export function ElectionsPage() {
  const wallet = useWallet();
  const verified = isVerified(wallet.address);

  const [now, setNow] = useState(Date.now());
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- CLOCK ---------------- */

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    async function fetchElections() {
      try {
        const res = await api.get("/election/get-all-elections");

        const mapped = (res.data.elections || []).map((e) => {
          const nowSec = Math.floor(Date.now() / 1000);

          let status = "Closed";
          if (nowSec < e.startTime) status = "Draft";
          else if (nowSec >= e.startTime && nowSec <= e.endTime)
            status = "Active";

          return {
            id: e.id,
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime,
            status,
            candidateCount: e.candidateCount
          };
        });

        setElections(mapped);
      } catch (err) {
        console.error("Failed to load elections", err);
      } finally {
        setLoading(false);
      }
    }

    fetchElections();
  }, []);

  const items = useMemo(() => {
    return elections.map((e) => {
      const remainingMs = e.endTime * 1000 - now;
      const isActive = e.status === "Active" && remainingMs > 0;
      return { ...e, remainingMs, isActive };
    });
  }, [now, elections]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold">Elections</h1>
          <p className="text-sm text-slate-400">
            Browse available elections and vote securely.
          </p>
        </div>

        <Badge tone={verified ? "success" : "warning"}>
          {wallet.status === "connected"
            ? verified
              ? "Verified"
              : "Not verified"
            : "Wallet not connected"}
        </Badge>
      </div>

      {loading ? (
        <Card>Loading elections...</Card>
      ) : items.length === 0 ? (
        <Card>No elections available</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((e) => (
            <Card key={e.id} className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-bold">{e.title}</div>
                  <div className="text-xs text-slate-400">
                    {e.candidateCount} candidates
                  </div>
                </div>

                <Badge tone={e.isActive ? "success" : "neutral"}>
                  {e.isActive ? "Active" : "Closed"}
                </Badge>
              </div>

              <div className="text-sm text-slate-300">
                {e.isActive
                  ? `Time remaining: ${formatDuration(e.remainingMs)}`
                  : "Election closed"}
              </div>

              <div className="mt-auto flex gap-2">
                {e.isActive ? (
                  <Link to={`/elections/${e.id}/vote`}>
                    <Button>View & Vote</Button>
                  </Link>
                ) : (
                  <Link to={`/elections/${e.id}/results`}>
                    <Button variant="secondary">View Results</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
