"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { Check, ChevronDown, PartyPopper, X } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ChecklistStep {
  id: string;
  title: React.ReactNode;
  /** What to do and why, shown when the step is open. */
  description?: React.ReactNode;
  /** The main button for the step, such as "Invite teammates". */
  action?: { label: string; onClick?: () => void; href?: string };
  /** Optional steps can be skipped and don't block "all done". */
  optional?: boolean;
}

export interface OnboardingChecklistProps {
  steps: ChecklistStep[];
  /** Controlled list of finished step ids. */
  value?: string[];
  /** Finished step ids at first, when uncontrolled. */
  defaultValue?: string[];
  /** Called with the finished step ids. */
  onValueChange?: (done: string[]) => void;
  /**
   * Heading.
   * @default "Get started"
   */
  title?: React.ReactNode;
  /** Line under the heading. */
  description?: React.ReactNode;
  /** Shows a close button. Called when the person dismisses the checklist. */
  onDismiss?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

function Ring({ value }: { value: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="size-10 shrink-0 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" className="stroke-muted" />
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
    </svg>
  );
}

/**
 * Getting-started checklist: progress ring, one open step at a time with its action,
 * mark done or skip, collapse, and a finished state. The next unfinished step opens by itself.
 */
export function OnboardingChecklist({ steps, value, defaultValue = [], onValueChange, title = "Get started", description, onDismiss, className }: OnboardingChecklistProps) {
  const [done, setDone] = useControllable<string[]>({ value, defaultValue, onChange: onValueChange });
  // undefined: follow the next unfinished step. null: the person closed every step.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [collapsed, setCollapsed] = useState(false);
  const uid = useId();

  const isDone = (id: string) => done.includes(id);
  const required = steps.filter((s) => !s.optional);
  const finished = required.every((s) => isDone(s.id));
  const count = steps.filter((s) => isDone(s.id)).length;
  const next = steps.find((s) => !isDone(s.id));
  const open = picked === undefined ? (next?.id ?? null) : picked && steps.some((s) => s.id === picked) ? picked : null;

  const complete = (id: string, on = true) => {
    const list = on ? [...new Set([...done, id])] : done.filter((x) => x !== id);
    setDone(list);
    setPicked(on ? undefined : id);
  };

  return (
    <section aria-labelledby={`${uid}-title`} className={cn("w-full overflow-hidden rounded-xl border bg-card text-left", className)}>
      <div className="flex items-center gap-3 p-4">
        <div className="relative grid place-items-center">
          <Ring value={steps.length ? count / steps.length : 0} />
          <span className="absolute text-[11px] font-semibold tabular-nums">{finished ? <Check className="size-4 text-primary" /> : `${count}/${steps.length}`}</span>
        </div>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 id={`${uid}-title`} className="truncate text-sm font-semibold">
            {finished ? "You're all set" : title}
          </h3>
          <p className="truncate text-[13px] text-muted-foreground">{finished ? "Every step is done. Nice work." : (description ?? `${steps.length - count} ${steps.length - count === 1 ? "step" : "steps"} left`)}</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls={`${uid}-steps`}
          aria-label={collapsed ? "Show steps" : "Hide steps"}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronDown className={cn("size-4 transition-transform duration-200", collapsed && "-rotate-90")} />
        </button>
        {onDismiss && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss checklist" className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>

      <div id={`${uid}-steps`} hidden={collapsed}>
        {finished ? (
          <div className="grid animate-fade justify-items-center gap-3 border-t px-4 py-6 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-primary">
              <PartyPopper className="size-5" />
            </span>
            <p className="max-w-xs text-[13px] text-muted-foreground">You can find these steps again in Settings at any time.</p>
            {onDismiss && (
              <button type="button" onClick={onDismiss} className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
                Close checklist
              </button>
            )}
          </div>
        ) : (
          <ol className="border-t">
            {steps.map((s, i) => {
              const d = isDone(s.id);
              const o = open === s.id;
              return (
                <li key={s.id} className={cn("border-b last:border-b-0", o && "bg-muted/40")}>
                  <div className="flex items-center gap-3 px-4">
                    <button
                      type="button"
                      onClick={() => complete(s.id, !d)}
                      aria-pressed={d}
                      aria-label={d ? `Mark "${typeof s.title === "string" ? s.title : `step ${i + 1}`}" as not done` : `Mark "${typeof s.title === "string" ? s.title : `step ${i + 1}`}" as done`}
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-200 active:scale-90",
                        d ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary"
                      )}
                    >
                      {d && <Check className="size-3" strokeWidth={3} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPicked(o ? null : s.id)}
                      aria-expanded={o}
                      aria-controls={`${uid}-${s.id}`}
                      className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left"
                    >
                      <span className={cn("min-w-0 flex-1 truncate text-sm", d ? "text-muted-foreground line-through decoration-muted-foreground/50" : "font-medium")}>{s.title}</span>
                      {s.optional && !d && <span className="shrink-0 text-xs text-muted-foreground">Optional</span>}
                    </button>
                  </div>
                  {o && (
                    <div id={`${uid}-${s.id}`} className="grid animate-fade gap-3 pb-4 pl-12 pr-4">
                      {s.description && <p className="text-[13px] leading-relaxed text-muted-foreground">{s.description}</p>}
                      <div className="flex flex-wrap items-center gap-2">
                        {s.action &&
                          (s.action.href ? (
                            <a href={s.action.href} onClick={s.action.onClick} className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
                              {s.action.label}
                            </a>
                          ) : (
                            <button type="button" onClick={s.action.onClick} className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
                              {s.action.label}
                            </button>
                          ))}
                        {!d && (
                          <button type="button" onClick={() => complete(s.id)} className="inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                            {s.optional ? "Skip" : "Mark as done"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
