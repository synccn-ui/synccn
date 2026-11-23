import type * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: React.ReactNode;
  time: string;
  description?: React.ReactNode;
  icon?: React.ElementType;
  tone?: "default" | "primary" | "success" | "destructive";
}

export interface TimelineProps {
  /** Events, newest first. */
  items: TimelineItem[];
  /** Extra classes for the root element. */
  className?: string;
}

/** items: [{ title, time, description?, icon?, tone? ("default" | "primary" | "success" | "destructive") }] */
export function Timeline({ items, className }: TimelineProps) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-white",
    destructive: "bg-destructive text-white",
  };
  return (
    <ol className={cn("relative grid gap-6", className)}>
      <span aria-hidden className="absolute bottom-2 left-[13px] top-2 w-px bg-border" />
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <li key={i} className="relative grid grid-cols-[28px_1fr] gap-3">
            <span
              className={cn(
                "z-10 grid size-7 place-items-center rounded-full ring-4 ring-background [&_svg]:size-3.5",
                tones[it.tone || "default"]
              )}
            >
              {Icon ? <Icon /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className="grid gap-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium">{it.title}</p>
                <time className="text-xs tabular-nums text-muted-foreground">{it.time}</time>
              </div>
              {it.description && <p className="text-sm leading-relaxed text-muted-foreground">{it.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
