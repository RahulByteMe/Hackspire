import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function NotFoundPage() {
  return (
    <Card>
      <div className="text-lg font-bold">Page not found</div>
      <div className="mt-2 text-sm text-slate-300">The page you're looking for doesn't exist.</div>
      <div className="mt-4">
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </Card>
  );
}
