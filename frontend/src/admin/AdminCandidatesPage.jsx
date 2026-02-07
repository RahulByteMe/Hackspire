import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input, Label } from "../components/Input";
import { useToast } from "../state/toast";

export function AdminCandidatesPage() {
  const { id } = useParams();
  const toast = useToast();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.push({ kind: "error", title: "Name required" });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/election/add-candidate", {
        electionId: parseInt(id),
        name
      });

      toast.push({
        kind: "success",
        title: "Candidate added",
        message: res.data.message
      });

      setName("");

    } catch (err) {
      toast.push({
        kind: "error",
        title: "Failed",
        message: err.response?.data?.message || "Error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <h1 className="text-xl font-bold">Add Candidate</h1>

        <div className="mt-4 space-y-4">
          <div>
            <Label>Candidate Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter candidate name"
            />
          </div>

          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
