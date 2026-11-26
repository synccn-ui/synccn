import type * as React from "react";
import { AlertTriangle, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type UsageStatus = "ok" | "warning" | "over" | "unlimited";

export interface UsageMeterProps {
  /** What's being measured, e.g. "API requests". */
  label: React.ReactNode;
  /** Amount used so far. */
  value: number;
  /** The plan's limit. Pass null for unlimited. */
  limit: number | null;
  /** Unit after the numbers, e.g. "GB". */
  unit?: string;
  /** Formats numbers. Defaults to compact notation: 1.2k, 3.4M. */
  format?: (n: number) => string;
  /**
   * Share of the limit at which the meter turns amber, from 0 to 1.
   * @default 0.8
   */
  warnAt?: number;
  /** Small print under the bar, such as "Resets Dec 1". */
  hint?: React.ReactNode;
  /** Something to do about it, such as an Upgrade link, shown when the meter is amber or over. */
  action?: React.ReactNode;
  /**
   * "default" stacks the label over the bar; "compact" fits on one line for lists.
   * @default "default"
   */
  size?: "default" | "compact";
  /** Extra classes for the root element. */
  className?: string;
}

const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

/** Works out the meter's state, so you can show the same thing elsewhere (a badge, an email). */
export function usageStatus(value: number, limit: number | null, warnAt = 0.8): UsageStatus {
  if (limit === null) return "unlimited";
  if (value > limit) return "over";
  if (limit > 0 && value / limit >= warnAt) return "warning";
  return "ok";
}

const FILL: Record<UsageStatus, string> = {
  ok: "bg-primary",
  warning: "bg-warning",
  over: "bg-destructive",
  unlimited: "bg-primary/60",
};

/**
 * Quota bar for plans and billing: used of limit, amber near the limit, red with the
 * overage once it's passed, and an "unlimited" state. Uses role meter with readable values.
 */
export function UsageMeter({ label, value, limit, unit, format = compact, warnAt = 0.8, hint, action, size = "default", className }: UsageMeterProps) {
  const status = usageStatus(value, limit, warnAt);
  const pct = limit === null ? 100 : limit === 0 ? (value > 0 ? 100 : 0) : Math.min(100, (value / limit) * 100);
  const u = unit ? ` ${unit}` : "";
  const valueText = limit === null ? `${format(value)}${u} used, unlimited` : `${format(value)}${u} of ${format(limit)}${u}${status === "over" ? `, ${format(value - limit)}${u} over the limit` : ""}`;

  const amount = (
    <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
      <span className={cn("font-medium text-foreground", status === "over" && "text-destructive")}>{format(value)}</span>
      {limit === null ? (
        <span className="inline-flex items-center gap-1">
          {u} <span aria-hidden>/</span> <InfinityIcon className="size-3.5" aria-label="unlimited" />
        </span>
      ) : (
        ` / ${format(limit)}${u}`
      )}
    </span>
  );

  const bar = (
    <div
      role="meter"
      aria-label={typeof label === "string" ? label : undefined}
      aria-valuemin={0}
      aria-valuemax={limit ?? Math.max(value, 1)}
      aria-valuenow={Math.min(value, limit ?? value)}
      aria-valuetext={valueText}
      className={cn("relative h-2 overflow-hidden rounded-full bg-muted", size === "compact" && "h-1.5 min-w-16 flex-1")}
    >
      <div className={cn("h-full rounded-full transition-[width,background-color] duration-500 ease-out", FILL[status])} style={{ width: `${pct}%` }} />
      {limit !== null && status !== "over" && warnAt < 1 && <span aria-hidden className="absolute inset-y-0 w-px bg-background/70" style={{ left: `${warnAt * 100}%` }} />}
      {status === "unlimited" && <span aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--background)_6px_8px)] opacity-40" />}
    </div>
  );

  if (size === "compact") {
    return (
      <div className={cn("flex min-w-0 items-center gap-3", className)}>
        <span className="w-28 shrink-0 truncate text-[13px] font-medium sm:w-36">{label}</span>
        {bar}
        {amount}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-sm font-medium">{label}</span>
        {amount}
      </div>
      {bar}
      {(hint || status === "over" || (status === "warning" && action)) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", status === "over" && "text-destructive", status === "warning" && "text-amber-700 dark:text-warning")}>
            {(status === "over" || status === "warning") && <AlertTriangle className="size-3.5 shrink-0" aria-hidden />}
            {status === "over" && limit !== null ? `${format(value - limit)}${u} over the limit` : status === "warning" && limit !== null ? `${Math.round(pct)}% used` : null}
            {(status === "over" || status === "warning") && hint ? <span className="text-muted-foreground"> · {hint}</span> : hint}
          </span>
          {(status === "over" || status === "warning") && action}
        </div>
      )}
    </div>
  );
}
