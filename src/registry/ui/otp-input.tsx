"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  /** Number of digits. */
  length?: number;
  /** Digits per group, separated by a dash. 0 for none. */
  group?: number;
  /** Called when every digit is filled. */
  onComplete?: (code: string) => void;
  /** Shows the error style. */
  invalid?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** One-time code field. Supports paste, arrows, backspace and a grouped layout. */
export function OtpInput({ length = 6, group = 3, onComplete, invalid, className }: OtpInputProps) {
  const [vals, setVals] = useState(() => Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const set = (i: number, ch: string) => {
    const next = [...vals];
    next[i] = ch;
    setVals(next);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  const onChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) return;
    if (digits.length > 1) return fill(i, digits);
    set(i, digits);
    focus(i + 1);
  };

  const fill = (start: number, text: string) => {
    const next = [...vals];
    [...text].slice(0, length - start).forEach((d, k) => (next[start + k] = d));
    setVals(next);
    focus(start + text.length);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (vals[i]) set(i, "");
      else {
        set(i - 1 >= 0 ? i - 1 : 0, "");
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  return (
    <div className={cn("flex items-center gap-2", className)} role="group" aria-label="One-time code">
      {vals.map((v, i) => (
        <span key={i} className="contents">
          {group && i > 0 && i % group === 0 && <span className="h-0.5 w-3 rounded-full bg-border" aria-hidden />}
          <input
            ref={(el) => {
                refs.current[i] = el;
              }}
            value={v}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={length}
            onChange={(e) => onChange(i, e)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={(e) => {
              e.preventDefault();
              fill(i, e.clipboardData.getData("text").replace(/\D/g, ""));
            }}
            onFocus={(e) => e.target.select()}
            className={cn(
              "size-11 rounded-lg border border-input bg-background text-center text-lg font-semibold tabular-nums shadow-xs caret-primary transition-[border-color,box-shadow]",
              "focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25",
              v && "border-foreground/30",
              invalid && "border-destructive"
            )}
          />
        </span>
      ))}
    </div>
  );
}
