"use client";

import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface RelativeTimeProps {
  /** The moment to describe. */
  date: Date | string | number;
  /**
   * Locale for the wording.
   * @default "en"
   */
  locale?: string;
  /**
   * "long" says "3 minutes ago", "short" says "3 min. ago", "narrow" says "3m ago".
   * @default "long"
   */
  format?: "long" | "short" | "narrow";
  /** Past this many days, shows the date instead ("Nov 3"). */
  absoluteAfterDays?: number;
  /** Extra classes for the root element. */
  className?: string;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
];

/** "3 minutes ago" / "in 2 days" for any date, using Intl.RelativeTimeFormat. */
export function formatRelative(date: Date, now: Date, locale = "en", format: "long" | "short" | "narrow" = "long"): string {
  const diff = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: format });
  if (Math.abs(diff) < 45) return rtf.format(0, "second");
  for (const [unit, secs] of UNITS) if (Math.abs(diff) >= secs || unit === "second") return rtf.format(Math.round(diff / secs), unit);
  return rtf.format(0, "second");
}

/**
 * "3 minutes ago" that keeps itself up to date every 15 seconds. Renders the exact date on the server, so pages never hydrate with the wrong text.
 */
export function RelativeTime({ date, locale = "en", format = "long", absoluteAfterDays, className }: RelativeTimeProps) {
  const d = date instanceof Date ? date : new Date(date);
  const now = useNow(15_000);
  const full = d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", timeZone: now ? undefined : "UTC" });
  let text = full;
  if (now) {
    const days = Math.abs(now.getTime() - d.getTime()) / 86_400_000;
    text = absoluteAfterDays !== undefined && days > absoluteAfterDays ? d.toLocaleDateString(locale, { month: "short", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" }) : formatRelative(d, now, locale, format);
  }
  return (
    <time dateTime={d.toISOString()} title={full} className={cn("tabular-nums", className)}>
      {text}
    </time>
  );
}
