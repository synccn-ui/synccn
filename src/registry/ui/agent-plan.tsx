"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { Check, ChevronDown, Circle, Loader2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanStepStatus = "pending" | "running" | "done" | "error" | "skipped";

export interface PlanStep {
  id: string;
  title: React.ReactNode;
  status: PlanStepStatus;
  /** More about the step: what was found, which files changed, why it failed. */
  detail?: React.ReactNode;
  /** Time taken, already formatted, e.g. "4s". */
  duration?: string;
}

export interface AgentPlanProps {
  steps: PlanStep[];
  /**
   * Heading.
   * @default "Plan"
   */
  title?: React.ReactNode;
  /**
   * Lets the person fold the steps away.
   * @default true
   */
  collapsible?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const ICON: Record<PlanStepStatus, { icon: React.ElementType; tone: string; label: string }> = {
  pending: { icon: Circle, tone: "border-muted-foreground/30 text-transparent", label: "Not started" },
  running: { icon: Loader2, tone: "border-primary text-primary", label: "In progress" },
  done: { icon: Check, tone: "border-primary bg-primary text-primary-foreground", label: "Done" },
  error: { icon: X, tone: "border-destructive bg-destructive text-white", label: "Failed" },
  skipped: { icon: Minus, tone: "border-muted-foreground/30 text-muted-foreground", label: "Skipped" },
};

/**
 * An agent's to-do list as it works: steps with live status, a progress bar, timing and
 * details. The running step is announced to screen readers as it changes.
 */
export function AgentPlan({ steps, title = "Plan", collapsible = true, className }: AgentPlanProps) {
  const [open, setOpen] = useState(true);
  const uid = useId();
  const finished = steps.filter((s) => s.status === "done" || s.status === "skipped").length;
  const running = steps.find((s) => s.status === "running");
  const failed = steps.some((s) => s.status === "error");
  const pct = steps.length ? (finished / steps.length) * 100 : 0;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card text-left", className)}>
      <div className="grid gap-2 px-3.5 pt-3">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
          <span className={cn("shrink-0 text-xs tabular-nums text-muted-foreground", failed && "text-destructive")}>
            {failed ? "Stopped" : `${finished} of ${steps.length}`}
          </span>
          {collapsible && (
            <button type="button" aria-expanded={open} aria-controls={`${uid}-steps`} aria-label={open ? "Hide steps" : "Show steps"} onClick={() => setOpen((o) => !o)} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", !open && "-rotate-90")} />
            </button>
          )}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", failed ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol id={`${uid}-steps`} hidden={!open} className="grid px-3.5 pb-2 pt-2">
        {steps.map((s, i) => {
          const st = ICON[s.status];
          const Icon = st.icon;
          return (
            <li key={s.id} className="relative flex gap-3 py-1.5">
              {i < steps.length - 1 && <span aria-hidden className={cn("absolute left-[9px] top-7 bottom-[-6px] w-px", s.status === "done" ? "bg-primary/40" : "bg-border")} />}
              <span className={cn("relative z-[1] mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full border bg-card", st.tone)} aria-hidden>
                <Icon className={cn("size-3", s.status === "running" && "animate-spin", s.status === "pending" && "size-0")} strokeWidth={3} />
              </span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <p className="flex items-baseline gap-2 text-sm">
                  <span className={cn("min-w-0 flex-1", s.status === "pending" && "text-muted-foreground", s.status === "skipped" && "text-muted-foreground line-through", s.status === "running" && "font-medium")}>
                    {s.title}
                    <span className="sr-only"> ({st.label})</span>
                  </span>
                  {s.duration && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{s.duration}</span>}
                </p>
                {s.detail && <div className={cn("text-[13px] leading-relaxed text-muted-foreground", s.status === "error" && "text-destructive")}>{s.detail}</div>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {running ? (typeof running.title === "string" ? `Working on: ${running.title}` : "Working") : finished === steps.length && steps.length ? "All steps done" : ""}
      </p>
    </div>
  );
}
