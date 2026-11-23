"use client";

import type * as React from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  /** Text to copy, or a function that returns it. */
  value: string | (() => string);
  /** Accessible label before copying. */
  label?: string;
  /** Called after a successful copy. */
  onCopied?: () => void;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Copies `value` and swaps to a check mark for a moment. */
export function CopyButton({ value, label = "Copy", className, onCopied, children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        const ok = await copyText(typeof value === "function" ? value() : value);
        if (ok) {
          setCopied(true);
          onCopied?.();
          setTimeout(() => setCopied(false), 1600);
        }
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
        children ? "h-8 px-2.5 text-xs font-medium" : "size-8",
        className
      )}
    >
      <span className="relative grid size-4 place-items-center">
        <Copy className={cn("absolute size-4 transition-all duration-200", copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} />
        <Check
          className={cn(
            "absolute size-4 text-success transition-all duration-200",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      {children && <span>{copied ? "Copied" : children}</span>}
    </button>
  );
}
