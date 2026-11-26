"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AgentPlan, type PlanStep } from "@/registry/ui/agent-plan";

const STEPS = [
  { id: "1", title: "Read the failing test", detail: "billing.test.ts expects proration for mid-cycle upgrades." },
  { id: "2", title: "Find where proration is calculated", detail: "lib/billing/prorate.ts, called from upgradePlan()." },
  { id: "3", title: "Fix the rounding bug", detail: "Days were floored before dividing; now rounded once at the end." },
  { id: "4", title: "Run the test suite", detail: "142 passed in 8.2s." },
  { id: "5", title: "Open a pull request" },
];

export default function AgentPlanDemo() {
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setAt(0);
    const t = setInterval(() => setAt((a) => (a >= STEPS.length ? a : a + 1)), 1500);
    return () => clearInterval(t);
  }, [run]);
  const steps: PlanStep[] = STEPS.map((s, i) => ({
    ...s,
    status: i < at ? "done" : i === at ? "running" : "pending",
    detail: i < at ? s.detail : undefined,
    duration: i < at ? `${2 + ((i * 3) % 5)}s` : undefined,
  }));
  return (
    <div className="grid w-full max-w-md gap-3">
      <AgentPlan title="Fix proration for mid-cycle upgrades" steps={steps} />
      <button type="button" onClick={() => setRun((r) => r + 1)} disabled={at < STEPS.length} className="inline-flex h-8 w-fit items-center gap-1.5 justify-self-center rounded-md px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40">
        <RotateCcw className="size-3.5" /> Run again
      </button>
    </div>
  );
}
