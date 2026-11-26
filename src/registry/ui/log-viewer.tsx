"use client";

import type * as React from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Search, WrapText } from "lucide-react";
import { cn } from "@/lib/utils";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogLine {
  /** Stable key. Defaults to the line's position. */
  id?: string;
  /** When it happened. */
  time: Date | string | number;
  level: LogLevel;
  message: string;
  /** Where it came from, such as a service or region. */
  source?: string;
}

export interface LogViewerProps {
  /** Lines, oldest first. Append to stream. */
  lines: LogLine[];
  /**
   * Keeps the newest line in view while the person is at the bottom. Scrolling up pauses it.
   * @default true
   */
  follow?: boolean;
  /**
   * Height of the scrolling area, in pixels.
   * @default 320
   */
  height?: number;
  /**
   * Only the newest lines are rendered beyond this.
   * @default 1000
   */
  maxLines?: number;
  /** Formats timestamps. Defaults to UTC HH:MM:SS.mmm, which renders the same on the server and in the browser. */
  formatTime?: (date: Date) => string;
  /**
   * Levels shown at first.
   * @default ["debug", "info", "warn", "error"]
   */
  defaultLevels?: LogLevel[];
  /** Heading shown in the toolbar. */
  title?: React.ReactNode;
  /** Extra buttons for the toolbar, such as Clear or Download. */
  actions?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];
const LEVEL_STYLE: Record<LogLevel, { label: string; text: string; row: string }> = {
  debug: { label: "DBG", text: "text-white/45", row: "" },
  info: { label: "INF", text: "text-[oklch(0.78_0.12_235)]", row: "" },
  warn: { label: "WRN", text: "text-[oklch(0.83_0.14_80)]", row: "bg-[oklch(0.8_0.14_80/0.07)]" },
  error: { label: "ERR", text: "text-[oklch(0.72_0.18_25)]", row: "bg-[oklch(0.65_0.2_25/0.12)]" },
};

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const utcTime = (d: Date) => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;

function Marked({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-[3px] bg-[oklch(0.83_0.14_80/0.35)] text-inherit">
            {p}
          </mark>
        ) : (
          p
        )
      )}
    </>
  );
}

/**
 * Streaming log output with level filters, search, line wrapping and follow mode.
 * New lines stay in view while you're at the bottom; scroll up to read and a
 * "new lines" button appears instead of the view jumping.
 */
export function LogViewer({ lines, follow = true, height = 320, maxLines = 1000, formatTime = utcTime, defaultLevels = LEVELS, title, actions, className }: LogViewerProps) {
  const [levels, setLevels] = useState<Set<LogLevel>>(() => new Set(defaultLevels));
  const [query, setQuery] = useState("");
  const [wrap, setWrap] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const lastCount = useRef(lines.length);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const l of lines) c[l.level]++;
    return c;
  }, [lines]);

  const q = query.trim();
  const shown = useMemo(() => {
    const ql = q.toLowerCase();
    const out = lines.map((l, i) => ({ ...l, n: i + 1 })).filter((l) => levels.has(l.level) && (!ql || l.message.toLowerCase().includes(ql) || l.source?.toLowerCase().includes(ql)));
    return out.slice(-maxLines);
  }, [lines, levels, q, maxLines]);

  // Stick to the bottom while following; otherwise count what arrived.
  useLayoutEffect(() => {
    const added = lines.length - lastCount.current;
    lastCount.current = lines.length;
    const el = scroller.current;
    if (!el) return;
    if (follow && atBottom) el.scrollTop = el.scrollHeight;
    else if (added > 0) setUnseen((u) => u + added);
  }, [lines, shown.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setAtBottom(bottom);
    if (bottom) setUnseen(0);
  };

  const jump = () => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnseen(0);
    setAtBottom(true);
  };

  const toggleLevel = (l: LogLevel) =>
    setLevels((s) => {
      const n = new Set(s);
      n.has(l) ? n.delete(l) : n.add(l);
      return n;
    });

  const digits = String(lines.length).length;

  return (
    <div className={cn("relative grid w-full overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.17_0_0)] text-left text-[oklch(0.9_0_0)]", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-2.5 py-2">
        {title && <p className="mr-1 truncate text-[13px] font-medium text-white/85">{title}</p>}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Log levels">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={levels.has(l)}
              onClick={() => toggleLevel(l)}
              className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded-md px-2 font-mono text-[11px] font-medium transition-colors",
                levels.has(l) ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
              )}
            >
              <span className={cn("size-1.5 rounded-full bg-current", levels.has(l) && LEVEL_STYLE[l].text)} aria-hidden />
              {l}
              <span className="tabular-nums text-white/45">{counts[l]}</span>
            </button>
          ))}
        </div>
        <label className="ml-auto flex h-7 min-w-0 flex-1 basis-40 items-center gap-1.5 rounded-md bg-white/5 px-2 focus-within:bg-white/10 sm:max-w-56">
          <Search className="size-3.5 shrink-0 text-white/45" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter lines"
            aria-label="Filter log lines"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white outline-none placeholder:text-white/40"
          />
        </label>
        <button
          type="button"
          aria-pressed={wrap}
          aria-label="Wrap long lines"
          title="Wrap long lines"
          onClick={() => setWrap((w) => !w)}
          className={cn("grid size-7 shrink-0 place-items-center rounded-md transition-colors", wrap ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/5 hover:text-white")}
        >
          <WrapText className="size-3.5" />
        </button>
        {actions}
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        role="log"
        aria-live="off"
        aria-label={typeof title === "string" ? title : "Log output"}
        tabIndex={0}
        className="overflow-auto py-1.5 font-mono text-[12px] leading-[1.65] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
        style={{ height }}
      >
        {shown.length === 0 && <p className="px-4 py-6 text-center font-sans text-[13px] text-white/45">{lines.length ? "No lines match the filters." : "Waiting for logs…"}</p>}
        <div className={cn(!wrap && "w-max min-w-full")}>
          {shown.map((l) => {
            const s = LEVEL_STYLE[l.level];
            const d = l.time instanceof Date ? l.time : new Date(l.time);
            return (
              <div key={l.id ?? l.n} className={cn("flex gap-3 px-3 hover:bg-white/[0.04]", s.row)}>
                <span className="shrink-0 select-none text-right tabular-nums text-white/25" style={{ width: `${digits}ch` }} aria-hidden>
                  {l.n}
                </span>
                <time dateTime={d.toISOString()} className="hidden shrink-0 tabular-nums text-white/45 sm:inline">
                  {formatTime(d)}
                </time>
                <span className={cn("shrink-0 font-semibold", s.text)}>
                  <span aria-hidden>{s.label}</span>
                  <span className="sr-only">{l.level}</span>
                </span>
                {l.source && <span className="hidden shrink-0 text-white/50 md:inline">[{l.source}]</span>}
                <span className={cn("min-w-0", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                  <Marked text={l.message} query={q} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {unseen > 0 && !atBottom && (
        <button
          type="button"
          onClick={jump}
          className="absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 animate-in items-center gap-1.5 rounded-full border border-white/10 bg-[oklch(0.26_0_0)] px-3 text-xs font-medium text-white shadow-lg hover:bg-[oklch(0.3_0_0)]"
        >
          <ArrowDown className="size-3.5" />
          {unseen} new {unseen === 1 ? "line" : "lines"}
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {unseen > 0 && !atBottom ? `${unseen} new log lines` : ""}
      </p>
    </div>
  );
}
