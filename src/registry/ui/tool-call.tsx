"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { Check, ChevronDown, CircleDashed, Loader2, ShieldQuestion, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolCallStatus = "pending" | "running" | "success" | "error" | "approval";

export interface ToolCallProps {
  /** The tool's name, e.g. search_docs. */
  name: string;
  /** What it does, in words. */
  description?: React.ReactNode;
  status: ToolCallStatus;
  /** Arguments the model passed. Objects are shown as formatted JSON. */
  input?: unknown;
  /** What the tool returned. */
  output?: unknown;
  /** Why it failed, when status is "error". */
  error?: React.ReactNode;
  /** How long it took, in milliseconds. */
  duration?: number;
  /** With status "approval", shows Approve and Deny. */
  onApprove?: () => void;
  onDeny?: () => void;
  /** Open at first. Calls waiting for approval or that failed are always open. */
  defaultOpen?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const STATUS: Record<ToolCallStatus, { label: string; icon: React.ElementType; tone: string }> = {
  pending: { label: "Queued", icon: CircleDashed, tone: "text-muted-foreground" },
  running: { label: "Running", icon: Loader2, tone: "text-primary" },
  success: { label: "Done", icon: Check, tone: "text-success" },
  error: { label: "Failed", icon: X, tone: "text-destructive" },
  approval: { label: "Needs approval", icon: ShieldQuestion, tone: "text-amber-700 dark:text-warning" },
};

const show = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v, null, 2));

/**
 * A tool or function call made by an agent: name, live status, arguments and result,
 * with an approval step for actions that need a yes first.
 */
export function ToolCall({ name, description, status, input, output, error, duration, onApprove, onDeny, defaultOpen = false, className }: ToolCallProps) {
  const [own, setOwn] = useState(defaultOpen);
  const uid = useId();
  const forced = status === "approval" || status === "error";
  const open = own || forced;
  const s = STATUS[status];
  const Icon = s.icon;

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border bg-card text-left text-sm", status === "approval" && "border-warning/60", className)}>
      <button type="button" onClick={() => setOwn((o) => !o)} aria-expanded={open} aria-controls={`${uid}-body`} disabled={forced} className="flex w-full min-w-0 items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/40 disabled:cursor-default disabled:hover:bg-transparent">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground" aria-hidden>
          <Wrench className="size-3.5" />
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="truncate font-mono text-[13px] font-medium">{name}</span>
          {description && <span className="truncate text-xs text-muted-foreground">{description}</span>}
        </span>
        <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs font-medium", s.tone)}>
          <Icon className={cn("size-3.5", status === "running" && "animate-spin")} aria-hidden />
          <span className="hidden sm:inline">{s.label}</span>
          <span className="sr-only sm:hidden">{s.label}</span>
          {duration != null && status === "success" && <span className="font-normal tabular-nums text-muted-foreground">· {duration < 1000 ? `${duration} ms` : `${(duration / 1000).toFixed(1)} s`}</span>}
        </span>
        {!forced && <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", !open && "-rotate-90")} aria-hidden />}
      </button>
      {open && (
        <div id={`${uid}-body`} className="grid animate-fade gap-2 border-t px-3 py-2.5">
          {input !== undefined && (
            <div className="grid gap-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Input</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted/60 px-2.5 py-2 font-mono text-xs leading-relaxed">{show(input)}</pre>
            </div>
          )}
          {status === "error" && error && <p className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">{error}</p>}
          {output !== undefined && status === "success" && (
            <div className="grid gap-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Output</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted/60 px-2.5 py-2 font-mono text-xs leading-relaxed">{show(output)}</pre>
            </div>
          )}
          {status === "approval" && (onApprove || onDeny) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="mr-auto text-xs text-muted-foreground">The assistant wants to run this.</span>
              {onDeny && (
                <button type="button" onClick={onDeny} className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-xs hover:bg-accent">
                  Deny
                </button>
              )}
              {onApprove && (
                <button type="button" onClick={onApprove} className="inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  Approve
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
