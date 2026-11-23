"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TerminalLine {
  type: "input" | "output";
  text: string;
  tone?: "success" | "muted";
}

export interface TerminalProps {
  /** Commands (typed out) and output (shown at once). */
  lines: TerminalLine[];
  /** Window title. */
  title?: string;
  /** Milliseconds per typed character. */
  speed?: number;
  /** Milliseconds after each command. */
  pause?: number;
  /** Start again after the last line. */
  loop?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Animated terminal. Lines with type "input" are typed out; "output" lines appear instantly.
 * lines: [{ type: "input" | "output", text, tone?: "success" | "muted" }]
 */
export function Terminal({ lines, title = "zsh", speed = 32, pause = 450, loop = false, className }: TerminalProps) {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) {
      if (!loop) return;
      const t = setTimeout(() => (setShown(0), setChars(0)), 2600);
      return () => clearTimeout(t);
    }
    const line = lines[shown];
    if (line.type === "input" && chars < line.text.length) {
      const t = setTimeout(() => setChars((c) => c + 1), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => (setShown((s) => s + 1), setChars(0)), line.type === "input" ? pause : 120);
    return () => clearTimeout(t);
  }, [shown, chars, lines, speed, pause, loop]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.16_0_0)] font-mono text-[13px] text-[oklch(0.9_0_0)] shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-white/40">{title}</span>
      </div>
      <div className="grid min-h-44 content-start gap-1 p-4" aria-live="polite">
        {lines.slice(0, shown + 1).map((l, i) => {
          const current = i === shown;
          if (current && shown >= lines.length) return null;
          const text = current && l.type === "input" ? l.text.slice(0, chars) : l.text;
          if (current && l.type === "output") return null;
          return (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap break-all",
                l.tone === "success" && "text-[oklch(0.8_0.15_150)]",
                l.tone === "muted" && "text-white/45"
              )}
            >
              {l.type === "input" && <span className="select-none text-white/40">$ </span>}
              {text}
              {current && <span className="ml-px inline-block h-[1.05em] w-[7px] translate-y-[2px] animate-blink bg-white/80" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
