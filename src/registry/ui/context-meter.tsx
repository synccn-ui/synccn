"use client";

import { useId, useRef, useState } from "react";
import { useClickOutside, useEscape } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ContextPart {
  label: string;
  /** Tokens. */
  value: number;
  /** CSS colour. Picked from a palette when not given. */
  color?: string;
}

export interface ContextMeterProps {
  /** Tokens in the conversation now. */
  used: number;
  /** The model's context window, in tokens. */
  limit: number;
  /** What the tokens are made of: system prompt, messages, files, tools. */
  breakdown?: ContextPart[];
  /**
   * Share of the window at which it turns amber, from 0 to 1.
   * @default 0.8
   */
  warnAt?: number;
  /** Shown in the panel when near the limit, e.g. what happens next. */
  hint?: string;
  /**
   * Opens the panel above or below the button.
   * @default "top"
   */
  side?: "top" | "bottom";
  /** Extra classes for the root element. */
  className?: string;
}

const PALETTE = ["var(--primary)", "oklch(0.7 0.15 230)", "oklch(0.72 0.16 155)", "oklch(0.75 0.15 70)", "oklch(0.66 0.2 15)"];
const k = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

/** How full the model's context window is: a small ring in the composer that opens into a breakdown by source. */
export function ContextMeter({ used, limit, breakdown, warnAt = 0.8, hint, side = "top", className }: ContextMeterProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);
  const ratio = limit ? Math.min(1, used / limit) : 0;
  const warn = ratio >= warnAt;
  const r = 7;
  const c = 2 * Math.PI * r;
  const total = breakdown?.reduce((a, p) => a + p.value, 0) || used;

  return (
    <div ref={root} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        aria-label={`Context ${Math.round(ratio * 100)}% full, ${k(used)} of ${k(limit)} tokens`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg viewBox="0 0 18 18" className="size-4 -rotate-90" aria-hidden>
          <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" className="stroke-muted" />
          <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" className={cn("transition-[stroke-dashoffset] duration-500", warn ? "stroke-warning" : "stroke-primary")} strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} />
        </svg>
        {Math.round(ratio * 100)}%
      </button>
      {open && (
        <div id={`${uid}-panel`} className={cn("absolute right-0 z-40 grid", side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5", " w-64 max-w-[calc(100vw-2rem)] animate-in gap-3 rounded-xl border bg-popover p-3.5 text-left text-popover-foreground shadow-lg")}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium">Context window</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {k(used)} / {k(limit)}
            </p>
          </div>
          {breakdown && breakdown.length > 0 && (
            <>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                {breakdown.map((p, i) => (
                  <span key={p.label} style={{ width: `${(p.value / limit) * 100}%`, background: p.color ?? PALETTE[i % PALETTE.length] }} />
                ))}
              </div>
              <ul className="grid gap-1.5">
                {breakdown.map((p, i) => (
                  <li key={p.label} className="flex items-center gap-2 text-xs">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: p.color ?? PALETTE[i % PALETTE.length] }} aria-hidden />
                    <span className="flex-1 text-muted-foreground">{p.label}</span>
                    <span className="tabular-nums">{k(p.value)}</span>
                    <span className="w-9 text-right tabular-nums text-muted-foreground">{Math.round((p.value / total) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {warn && <p className="rounded-md bg-warning/15 px-2.5 py-2 text-xs text-amber-800 dark:text-warning">{hint ?? "Almost full. Older messages may be summarized or dropped."}</p>}
        </div>
      )}
    </div>
  );
}
