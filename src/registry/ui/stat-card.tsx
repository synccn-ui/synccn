import type * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/registry/ui/charts";

export interface StatCardProps {
  /** What the number measures. */
  label: React.ReactNode;
  /** Formatted value. */
  value: React.ReactNode;
  /** Percentage change since last period. */
  change?: number;
  /** What the change is measured against. */
  changeLabel?: string;
  /** Whether a rise is good news (revenue) or bad news (error rate, latency). Sets the colour. */
  goodWhen?: "up" | "down";
  /** Values for the sparkline. */
  trend?: number[];
  /** Icon in the corner. */
  icon?: React.ElementType;
  /** Extra classes for the root element. */
  className?: string;
}

/** KPI tile: label, value, change since last period and a trend line. */
export function StatCard({ label, value, change, changeLabel = "vs last month", goodWhen = "up", trend, icon: Icon, className }: StatCardProps) {
  const up = (change ?? 0) >= 0;
  const good = goodWhen === "up" ? up : !up;
  return (
    <div className={cn("grid gap-3 rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {change != null && (
            <p className={cn("inline-flex items-center gap-1 text-xs font-medium", good ? "text-success" : "text-destructive")}>
              {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {up ? "+" : ""}
              {change}% <span className="font-normal text-muted-foreground">{changeLabel}</span>
            </p>
          )}
        </div>
        {trend && <Sparkline values={trend} />}
      </div>
    </div>
  );
}
