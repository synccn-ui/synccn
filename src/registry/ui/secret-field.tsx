"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export interface SecretFieldProps {
  /** The secret, such as an API key or webhook signing secret. */
  value: string;
  /** Label shown above the field. */
  label?: string;
  /**
   * Characters left visible at the end while hidden, like "sk_live_••••3f9a".
   * @default 4
   */
  visibleEnd?: number;
  /** Shows a button to roll a new secret. Called when it's clicked; return a promise to show a spinner. */
  onRegenerate?: () => unknown;
  /** Small print under the field. */
  hint?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Read-only field for API keys and tokens: masked by default with the prefix and last
 * characters showing, reveal, copy, and an optional regenerate button.
 */
export function SecretField({ value, label, visibleEnd = 4, onRegenerate, hint, className }: SecretFieldProps) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const prefix = value.match(/^[a-z]+_(?:[a-z]+_)?/i)?.[0] ?? "";
  const masked = `${prefix}${"•".repeat(Math.max(8, Math.min(24, value.length - prefix.length - visibleEnd)))}${value.slice(-visibleEnd)}`;
  const btn = "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50";

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex h-9 min-w-0 items-center gap-0.5 rounded-md border border-input bg-muted/40 pl-3 pr-1 shadow-xs">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px]" aria-label={shown ? undefined : `${label ?? "Secret"}, hidden`}>
          {shown ? value : masked}
        </code>
        <button type="button" className={btn} aria-label={shown ? "Hide" : "Reveal"} aria-pressed={shown} onClick={() => setShown((s) => !s)}>
          {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
        <button
          type="button"
          className={btn}
          aria-label={copied ? "Copied" : "Copy"}
          onClick={async () => {
            if (await copyText(value)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </button>
        {onRegenerate && (
          <button
            type="button"
            className={btn}
            aria-label="Regenerate"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onRegenerate();
              } finally {
                setBusy(false);
              }
            }}
          >
            <RefreshCw className={cn("size-3.5", busy && "animate-spin")} />
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
