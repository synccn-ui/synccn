"use client";

import type * as React from "react";
import { useId, useRef, useState } from "react";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  /** Runs before moving on. Return true to continue, or a message to show instead. Can be async. */
  validate?: () => true | string | Promise<true | string>;
}

export interface WizardProps {
  steps: WizardStep[];
  /** Controlled step index. */
  step?: number;
  /**
   * Step at first, when uncontrolled.
   * @default 0
   */
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Runs after the last step validates. Return a promise to show a spinner. */
  onComplete: () => unknown;
  /**
   * Label on the last button.
   * @default "Finish"
   */
  finishLabel?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Multi-step form: a step header with progress, one step at a time, validation (sync or
 * async) before moving on, Back without losing anything, and focus moved to each new step.
 */
export function Wizard({ steps, step, defaultStep = 0, onStepChange, onComplete, finishLabel = "Finish", className }: WizardProps) {
  const [current, setCurrent] = useControllable({ value: step, defaultValue: defaultStep, onChange: onStepChange });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [furthest, setFurthest] = useState(current);
  const heading = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const s = steps[current];
  const last = current === steps.length - 1;

  const go = (i: number) => {
    setError("");
    setCurrent(i);
    setFurthest((f) => Math.max(f, i));
    requestAnimationFrame(() => heading.current?.focus());
  };

  const next = async () => {
    setBusy(true);
    try {
      const ok = s.validate ? await s.validate() : true;
      if (ok !== true) return setError(ok);
      if (last) await onComplete();
      else go(current + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => (e.preventDefault(), next())}
      className={cn("grid w-full gap-5 rounded-xl border bg-card p-5 text-left", className)}
      aria-labelledby={`${uid}-title`}
    >
      <ol className="flex items-center gap-2" aria-label="Steps">
        {steps.map((st, i) => {
          const done = i < current;
          const reachable = i <= furthest && i !== current;
          return (
            <li key={st.id} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!reachable || busy}
                onClick={() => go(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${st.title}${done ? ", done" : ""}`}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors disabled:cursor-default",
                  i === current ? "border-primary bg-primary text-primary-foreground" : done ? "border-primary bg-brand-soft text-primary" : "border-border text-muted-foreground",
                  reachable && "hover:border-primary"
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </button>
              <span className={cn("hidden truncate text-xs font-medium sm:block", i === current ? "text-foreground" : "text-muted-foreground")}>{st.title}</span>
              {i < steps.length - 1 && <span className={cn("h-px min-w-3 flex-1", i < current ? "bg-primary" : "bg-border")} aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-1">
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          Step {current + 1} of {steps.length}
        </p>
        <h3 ref={heading} tabIndex={-1} id={`${uid}-title`} className="text-lg font-semibold tracking-tight outline-none">
          {s.title}
        </h3>
        {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
      </div>

      <div key={s.id} className="grid animate-fade gap-4">
        {s.content}
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t pt-4">
        <button type="button" onClick={() => go(current - 1)} disabled={current === 0 || busy} className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-0">
          <ChevronLeft className="size-4" /> Back
        </button>
        <button type="submit" disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-70">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {last ? finishLabel : "Continue"}
        </button>
      </div>
    </form>
  );
}
