"use client";

import type * as React from "react";
import { useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Avatar } from "@/registry/ui/avatar";

export interface ActivityEvent {
  id: string;
  /** Who did it. */
  actor: { name: string; avatar?: string };
  /** What they did, e.g. "deployed" or "commented on". */
  action: React.ReactNode;
  /** What it was done to, e.g. "api-gateway". */
  target?: React.ReactNode;
  /** When it happened. */
  time: Date | string | number;
  /** Groups events for the type filter, e.g. "deploy". */
  type?: string;
  /** Icon for the event type, shown on the line instead of the avatar. */
  icon?: React.ElementType;
  /** Outcome colour on the line. */
  status?: "success" | "error" | "warning" | "info" | "neutral";
  /** Extra content revealed with "Details". */
  details?: React.ReactNode;
}

export interface ActivityTimelineProps {
  /** Events, in any order. */
  events: ActivityEvent[];
  /** Show a filter for these event types. Labels keyed by `type`. */
  types?: Record<string, string>;
  /** Group events under day headings. Default true. */
  groupByDay?: boolean;
  /** Shown when nothing matches. */
  empty?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

const TONE = {
  success: "bg-success",
  error: "bg-destructive",
  warning: "bg-warning",
  info: "bg-primary",
  neutral: "bg-muted-foreground/50",
};

const toDate = (t: ActivityEvent["time"]) => (t instanceof Date ? t : new Date(t));

function relative(d: Date, now: Date | null) {
  if (!now) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function dayLabel(d: Date, now: Date | null) {
  if (now) {
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((a - b) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
  }
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function Item({ e, now, last }: { e: ActivityEvent; now: Date | null; last: boolean }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const d = toDate(e.time);
  const Icon = e.icon;
  return (
    <li className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
      {!last && <span aria-hidden className="absolute bottom-0 left-[15.5px] top-9 w-px bg-border" />}
      <span className="relative">
        {Icon ? (
          <span className="grid size-8 place-items-center rounded-full border bg-card text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : (
          <Avatar name={e.actor.name} src={e.actor.avatar} size="sm" />
        )}
        {e.status && <span aria-hidden className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-background", TONE[e.status])} />}
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-sm leading-relaxed">
          <span className="font-medium">{e.actor.name}</span> <span className="text-muted-foreground">{e.action}</span>
          {e.target != null && <> <span className="font-medium">{e.target}</span></>}
          {e.status && <span className="sr-only">, {e.status}</span>}
        </p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={d.toISOString()} title={d.toLocaleString()} suppressHydrationWarning>
            {relative(d, now)}
          </time>
          {e.details && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-0.5 rounded font-medium hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Details <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
          )}
        </div>
        {e.details && (
          <div id={detailsId} hidden={!open} className="mt-2 animate-fade rounded-lg border bg-muted/40 p-3 text-sm">
            {e.details}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Chronological feed for audit logs, deploy history and project activity: grouped by
 * day, newest first, with avatars or type icons, outcome dots, expandable details and
 * an optional type filter.
 */
export function ActivityTimeline({ events, types, groupByDay = true, empty = "No activity yet.", className }: ActivityTimelineProps) {
  const now = useNow(60000);
  const [type, setType] = useState<string | null>(null);
  const sorted = useMemo(() => [...events].sort((a, b) => toDate(b.time).getTime() - toDate(a.time).getTime()), [events]);
  const shown = type ? sorted.filter((e) => e.type === type) : sorted;
  const groups = useMemo(() => {
    if (!groupByDay) return [{ key: "all", label: null as string | null, items: shown }];
    const out: { key: string; label: string | null; items: ActivityEvent[] }[] = [];
    for (const e of shown) {
      const d = toDate(e.time);
      const key = d.toDateString();
      const last = out[out.length - 1];
      if (last?.key === key) last.items.push(e);
      else out.push({ key, label: dayLabel(d, now), items: [e] });
    }
    return out;
  }, [shown, groupByDay, now]);

  return (
    <div className={cn("grid gap-4", className)}>
      {types && (
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">
          {[[null, "All"] as const, ...Object.entries(types)].map(([k, label]) => (
            <button
              key={k ?? "all"}
              type="button"
              aria-pressed={type === k}
              onClick={() => setType(k)}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring", type === k ? "border-foreground/40 bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        groups.map((g) => (
          <section key={g.key} aria-label={g.label ?? "Activity"} className="grid gap-3">
            {g.label && (
              <h3 className="text-xs font-medium text-muted-foreground" suppressHydrationWarning>
                {g.label}
              </h3>
            )}
            <ol className="grid">
              {g.items.map((e, i) => (
                <Item key={e.id} e={e} now={now} last={i === g.items.length - 1} />
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
