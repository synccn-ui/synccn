"use client";

import { useState } from "react";
import { AsyncState, useAsync } from "@/registry/ui/async-state";
import { ToggleGroup } from "@/registry/ui/toggle-group";

type Outcome = "success" | "empty" | "error" | "slow";

const INVOICES = [
  { id: "INV-1042", amount: "$1,250.00", status: "Paid" },
  { id: "INV-1043", amount: "$820.00", status: "Due in 3 days" },
  { id: "INV-1044", amount: "$2,400.00", status: "Draft" },
];

// Pretend request: the outcome picker decides what the "server" does.
const request = (outcome: Outcome, signal: AbortSignal) =>
  new Promise<typeof INVOICES>((resolve, reject) => {
    const t = setTimeout(() => (outcome === "error" ? reject(new Error("The billing service returned 500.")) : resolve(outcome === "empty" ? [] : INVOICES)), outcome === "slow" ? 10000 : 900);
    signal.addEventListener("abort", () => clearTimeout(t));
  });

export default function AsyncStateDemo() {
  const [outcome, setOutcome] = useState<Outcome>("success");
  const result = useAsync((signal) => request(outcome, signal), [outcome], { timeout: 3000 });
  return (
    <div className="grid w-full max-w-md gap-4">
      <ToggleGroup
        size="sm"
        value={outcome}
        onValueChange={(v) => setOutcome(v as Outcome)}
        options={[
          { value: "success", label: "Loads" },
          { value: "empty", label: "Empty" },
          { value: "error", label: "Fails" },
          { value: "slow", label: "Times out" },
        ]}
      />
      <div className="rounded-xl border bg-card p-4">
        <AsyncState {...result} onRetry={result.retry} label="invoices">
          {(rows) => (
            <ul className="divide-y text-sm">
              {rows.map((r) => (
                <li key={r.id} className="flex justify-between py-2">
                  <span className="font-mono">{r.id}</span>
                  <span className="tabular-nums">{r.amount}</span>
                  <span className="text-muted-foreground">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </AsyncState>
      </div>
    </div>
  );
}
