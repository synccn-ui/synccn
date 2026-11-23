import type * as React from "react";
import { cn } from "@/lib/utils";

export type Status = "online" | "busy" | "away" | "offline" | "info";

const TONES = {
  online: { dot: "bg-success", ring: "bg-success/40", label: "Operational" },
  busy: { dot: "bg-destructive", ring: "bg-destructive/40", label: "Outage" },
  away: { dot: "bg-warning", ring: "bg-warning/40", label: "Degraded" },
  offline: { dot: "bg-muted-foreground", ring: "", label: "Offline" },
  info: { dot: "bg-sky-500", ring: "bg-sky-500/40", label: "Maintenance" },
};

export interface StatusIndicatorProps {
  /** Colour and default label. */
  status?: Status;
  /** Custom label, or false to hide it. */
  label?: React.ReactNode | false;
  /** Animated ring around the dot. */
  pulse?: boolean;
  /** Dot size. */
  size?: "sm" | "default" | "lg";
  /** Extra classes for the root element. */
  className?: string;
}

/** A dot with an optional pulse and label, for presence or system status. */
export function StatusIndicator({ status = "online", label, pulse = true, size = "default", className }: StatusIndicatorProps) {
  const t = TONES[status];
  const s = size === "sm" ? "size-1.5" : size === "lg" ? "size-3" : "size-2";
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className={cn("relative inline-flex", s)}>
        {pulse && t.ring && <span className={cn("absolute inset-0 animate-ping rounded-full motion-reduce:animate-none", t.ring)} />}
        <span className={cn("relative inline-flex rounded-full", s, t.dot)} />
      </span>
      {label !== false && <span>{label ?? t.label}</span>}
    </span>
  );
}

export interface DescriptionListProps {
  /** Rows. */
  items: { term: React.ReactNode; detail: React.ReactNode }[];
  /** Extra classes for the root element. */
  className?: string;
}

/** Key–value details, stacked on phones and side by side on wider screens. items: [{ term, detail }] */
export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cn("w-full divide-y rounded-xl border", className)}>
      {items.map((it, i) => (
        <div key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
          <dt className="text-sm text-muted-foreground">{it.term}</dt>
          <dd className="min-w-0 text-sm">{it.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface ListItemProps {
  /** Avatar, icon or image on the left. */
  media?: React.ReactNode;
  /** Main text. */
  title: React.ReactNode;
  /** Secondary text. */
  description?: React.ReactNode;
  /** Controls on the right. */
  actions?: React.ReactNode;
  /** Renders the row as a link. */
  href?: string;
  /** Renders the row as a button. */
  onClick?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Flexible row for lists: media, title, description and trailing actions. */
export function ListItem({ media, title, description, actions, href, onClick, className }: ListItemProps) {
  const Comp = href ? "a" : onClick ? "button" : "div";
  return (
    <Comp
      href={href}
      onClick={onClick}
      type={Comp === "button" ? "button" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
        (href || onClick) && "transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
    >
      {media && <span className="shrink-0">{media}</span>}
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-sm font-medium">{title}</span>
        {description && <span className="truncate text-[13px] text-muted-foreground">{description}</span>}
      </span>
      {actions && <span className="flex shrink-0 items-center gap-1">{actions}</span>}
    </Comp>
  );
}
