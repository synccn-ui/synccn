"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/** Minimal line diff (longest common subsequence). */
type DiffRow = { t: " " | "-" | "+"; s: string; a?: number; b?: number };

function diffLines(a: string, b: string): DiffRow[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const dp: number[][] = Array.from({ length: A.length + 1 }, () => Array<number>(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--)
    for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) out.push({ t: " ", s: A[i], a: ++i, b: ++j });
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: "-", s: A[i], a: ++i });
    else out.push({ t: "+", s: B[j], b: ++j });
  }
  while (i < A.length) out.push({ t: "-", s: A[i], a: ++i });
  while (j < B.length) out.push({ t: "+", s: B[j], b: ++j });
  return out;
}

export interface CodeDiffProps {
  /** Original text. */
  before: string;
  /** Changed text. */
  after: string;
  /** Shown in the header. */
  filename?: string;
  /** View shown first. */
  defaultView?: "unified" | "split";
  /** Extra classes for the root element. */
  className?: string;
}

/** Unified or split view of the changes between two versions of a file. */
export function CodeDiff({ before, after, filename, defaultView = "unified", className }: CodeDiffProps) {
  const [view, setView] = useState<"split" | "unified">(defaultView);
  const rows = useMemo(() => diffLines(before, after), [before, after]);
  const added = rows.filter((r) => r.t === "+").length;
  const removed = rows.filter((r) => r.t === "-").length;
  const tone = { "+": "bg-[oklch(0.72_0.16_155/0.13)]", "-": "bg-[oklch(0.65_0.2_25/0.13)]", " ": "" };
  const mark = { "+": "text-[oklch(0.75_0.16_155)]", "-": "text-[oklch(0.7_0.19_25)]", " ": "text-white/25" };

  const Line = ({ r, n }: { r: DiffRow; n?: number }) => (
    <div className={cn("flex min-w-max", tone[r.t])}>
      <span className="w-10 shrink-0 select-none pr-3 text-right text-white/25">{n ?? ""}</span>
      <span className={cn("w-4 shrink-0 select-none", mark[r.t])}>{r.t}</span>
      <span className="pr-4">{r.s || " "}</span>
    </div>
  );

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.16_0_0)] font-mono text-[12.5px] leading-6 text-[oklch(0.9_0_0)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-2 text-xs">
        <span className="truncate text-white/70">{filename}</span>
        <span className="text-[oklch(0.75_0.16_155)]">+{added}</span>
        <span className="text-[oklch(0.7_0.19_25)]">−{removed}</span>
        <div className="ml-auto flex rounded-md bg-white/5 p-0.5">
          {(["unified", "split"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded px-2 py-0.5 capitalize transition-colors",
                view === v ? "bg-white/12 text-white" : "text-white/50 hover:text-white"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {view === "unified" ? (
        <div className="overflow-x-auto py-2 scrollbar-thin">
          {rows.map((r, i) => (
            <Line key={i} r={r} n={r.t === "-" ? r.a : r.b} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-white/8">
          {(["a", "b"] as const).map((side) => (
            <div key={side} className="overflow-x-auto py-2 scrollbar-thin">
              {rows
                .filter((r) => r.t === " " || r.t === (side === "a" ? "-" : "+"))
                .map((r, i) => (
                  <Line key={i} r={r} n={r[side]} />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
