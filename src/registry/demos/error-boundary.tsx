"use client";

import { useState } from "react";
import { Bomb } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { ErrorBoundary } from "@/registry/ui/error-boundary";

function Revenue({ broken }: { broken: boolean }) {
  if (broken) throw new Error("Cannot read properties of undefined (reading 'total')");
  return (
    <div className="grid gap-1 rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">Revenue this month</p>
      <p className="text-2xl font-semibold tabular-nums">$48,290</p>
    </div>
  );
}

export default function ErrorBoundaryDemo() {
  const [broken, setBroken] = useState(false);
  const [logged, setLogged] = useState(0);
  return (
    <div className="grid w-full max-w-md gap-3">
      <ErrorBoundary onError={() => setLogged((n) => n + 1)} onReset={() => setBroken(false)}>
        <Revenue broken={broken} />
      </ErrorBoundary>
      <div className="flex items-center justify-between gap-3">
        <Button size="sm" variant="outline" onClick={() => setBroken(true)} disabled={broken}>
          <Bomb /> Break the widget
        </Button>
        <span className="text-xs text-muted-foreground">Errors sent to logging: {logged}</span>
      </div>
    </div>
  );
}
