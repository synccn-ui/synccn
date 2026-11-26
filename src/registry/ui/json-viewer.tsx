"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { Check, ChevronRight, ChevronsDownUp, ChevronsUpDown, Copy, Search } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface JsonViewerProps {
  /** The value to show. Anything JSON.stringify accepts; dates and undefined are shown as strings. */
  data: unknown;
  /**
   * Levels open at first. 0 shows only the root, Infinity opens everything.
   * @default 1
   */
  defaultExpandDepth?: number;
  /**
   * Label for the root row.
   * @default "root"
   */
  rootName?: string;
  /**
   * Shows a search box that highlights matching keys and values and opens their parents.
   * @default true
   */
  searchable?: boolean;
  /** Called when a row is focused, with its path (for example `user.roles[0]`) and value. */
  onSelect?: (path: string, value: unknown) => void;
  /**
   * Maximum height before the tree scrolls, in pixels.
   * @default 360
   */
  maxHeight?: number;
  /** Extra classes for the root element. */
  className?: string;
}

interface Row {
  path: string;
  key: string | number | null;
  value: unknown;
  depth: number;
  container: boolean;
  size: number;
  parent: string | null;
  posinset: number;
  setsize: number;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;
const childPath = (parent: string, key: string | number) =>
  typeof key === "number" ? `${parent}[${key}]` : IDENT.test(key) ? (parent ? `${parent}.${key}` : key) : `${parent}[${JSON.stringify(key)}]`;

const isContainer = (v: unknown): v is Record<string, unknown> | unknown[] => typeof v === "object" && v !== null && !(v instanceof Date);
const entriesOf = (v: Record<string, unknown> | unknown[]): [string | number, unknown][] =>
  Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v);

const primitiveText = (v: unknown) => {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (v instanceof Date) return JSON.stringify(v.toISOString());
  if (typeof v === "string") return JSON.stringify(v);
  return String(v);
};

const tone = (v: unknown) =>
  v === null || v === undefined
    ? "text-muted-foreground italic"
    : typeof v === "string" || v instanceof Date
      ? "text-[oklch(0.55_0.14_155)] dark:text-[oklch(0.78_0.14_155)]"
      : typeof v === "number" || typeof v === "bigint"
        ? "text-[oklch(0.55_0.15_250)] dark:text-[oklch(0.78_0.12_240)]"
        : typeof v === "boolean"
          ? "text-[oklch(0.58_0.15_60)] dark:text-[oklch(0.8_0.14_75)]"
          : "";

/** Walks every node once, so search and "expand all" know the whole tree. */
function index(data: unknown) {
  const all: Row[] = [];
  const walk = (value: unknown, key: Row["key"], path: string, depth: number, parent: string | null, posinset: number, setsize: number) => {
    const container = isContainer(value);
    const kids = container ? entriesOf(value) : [];
    all.push({ path, key, value, depth, container, size: kids.length, parent, posinset, setsize });
    kids.forEach(([k, v], i) => walk(v, k, childPath(path, k), depth + 1, path, i + 1, kids.length));
  };
  walk(data, null, "", 0, null, 1, 1);
  return all;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-warning/40 text-inherit">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/**
 * Collapsible JSON tree with type colours, search, keyboard navigation and copy for paths and values.
 * Paths are written the way you'd read them in code: `user.roles[0]`, `headers["content-type"]`.
 */
export function JsonViewer({ data, defaultExpandDepth = 1, rootName = "root", searchable = true, onSelect, maxHeight = 360, className }: JsonViewerProps) {
  const all = useMemo(() => index(data), [data]);
  const byPath = useMemo(() => new Map(all.map((r) => [r.path, r])), [all]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(all.filter((r) => r.container && r.depth < defaultExpandDepth).map((r) => r.path)));
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("");
  const [copied, setCopied] = useState<"path" | "value" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return new Set<string>();
    return new Set(all.filter((r) => (r.key !== null && String(r.key).toLowerCase().includes(q)) || (!r.container && primitiveText(r.value).toLowerCase().includes(q))).map((r) => r.path));
  }, [all, q]);

  // Parents of every match are opened while searching, without changing what the person opened.
  const forced = useMemo(() => {
    const s = new Set<string>();
    for (const p of matches) for (let r = byPath.get(p); r?.parent != null; r = byPath.get(r.parent)) s.add(r.parent);
    return s;
  }, [matches, byPath]);
  const isOpen = (p: string) => open.has(p) || forced.has(p);

  const visible = useMemo(() => {
    const out: Row[] = [];
    for (const r of all) {
      let shown = true;
      for (let p = r.parent; p !== null; p = byPath.get(p)?.parent ?? null) if (!isOpen(p)) shown = false;
      if (shown) out.push(r);
    }
    return out;
  }, [all, byPath, open, forced]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (p: string, force?: boolean) =>
    setOpen((s) => {
      const n = new Set(s);
      (force ?? !n.has(p)) ? n.add(p) : n.delete(p);
      return n;
    });

  const focusRow = (p: string) => {
    setActive(p);
    const r = byPath.get(p);
    if (r) onSelect?.(p || rootName, r.value);
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-path="${CSS.escape(p)}"]`)?.focus());
  };

  const onKey = (e: React.KeyboardEvent, r: Row, i: number) => {
    const go = (j: number) => visible[j] && (e.preventDefault(), focusRow(visible[j].path));
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(visible.length - 1);
    else if (e.key === "ArrowRight" && r.container) {
      e.preventDefault();
      if (!isOpen(r.path)) toggle(r.path, true);
      else go(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (r.container && isOpen(r.path) && !forced.has(r.path)) toggle(r.path, false);
      else if (r.parent !== null) focusRow(r.parent);
    } else if ((e.key === "Enter" || e.key === " ") && r.container) {
      e.preventDefault();
      toggle(r.path);
    }
  };

  const current = byPath.get(active) ?? all[0];
  const copy = async (what: "path" | "value") => {
    const text = what === "path" ? current.path || rootName : current.container ? JSON.stringify(current.value, null, 2) : current.value instanceof Date ? current.value.toISOString() : typeof current.value === "string" ? current.value : String(current.value);
    if (await copyText(text)) {
      setCopied(what);
      setTimeout(() => setCopied(null), 1400);
    }
  };
  const containers = all.filter((r) => r.container).map((r) => r.path);
  const allOpen = containers.every((p) => open.has(p));
  const tabStop = visible.some((r) => r.path === active) ? active : visible[0]?.path;

  return (
    <div className={cn("grid w-full overflow-hidden rounded-xl border bg-card text-left", className)}>
      <div className="flex items-center gap-1.5 border-b px-2 py-1.5">
        {searchable ? (
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 focus-within:bg-muted/60">
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keys and values"
              aria-label="Search JSON"
              className="h-7 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {matches.size} {matches.size === 1 ? "match" : "matches"}
              </span>
            )}
          </label>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(containers))}
          aria-label={allOpen ? "Collapse all" : "Expand all"}
          title={allOpen ? "Collapse all" : "Expand all"}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {allOpen ? <ChevronsDownUp className="size-3.5" /> : <ChevronsUpDown className="size-3.5" />}
        </button>
      </div>

      <div ref={listRef} role="tree" aria-label={rootName} className="overflow-auto py-1 font-mono text-[12.5px] leading-6" style={{ maxHeight }}>
        {visible.map((r, i) => {
          const o = isOpen(r.path);
          const hit = matches.has(r.path);
          const brackets = Array.isArray(r.value) ? ["[", "]"] : ["{", "}"];
          return (
            <div
              key={r.path || "$root"}
              data-path={r.path}
              role="treeitem"
              aria-level={r.depth + 1}
              aria-posinset={r.posinset}
              aria-setsize={r.setsize}
              aria-expanded={r.container ? o : undefined}
              aria-selected={active === r.path}
              tabIndex={tabStop === r.path ? 0 : -1}
              onKeyDown={(e) => onKey(e, r, i)}
              onFocus={() => active !== r.path && (setActive(r.path), onSelect?.(r.path || rootName, r.value))}
              onClick={() => r.container && toggle(r.path)}
              className={cn(
                "flex min-w-0 cursor-default items-start gap-1 pr-3 outline-none",
                r.container && "cursor-pointer",
                active === r.path ? "bg-accent" : "hover:bg-muted/60",
                "focus-visible:bg-accent focus-visible:shadow-[inset_2px_0_0_var(--ring)]",
                hit && "bg-warning/10"
              )}
              style={{ paddingLeft: 8 + r.depth * 16 }}
            >
              <span className="grid h-6 w-4 shrink-0 place-items-center text-muted-foreground" aria-hidden>
                {r.container && <ChevronRight className={cn("size-3.5 transition-transform duration-150", o && "rotate-90")} />}
              </span>
              <span className="min-w-0 break-all">
                <span className={cn(r.key === null || typeof r.key === "number" ? "text-muted-foreground" : "text-foreground")}>
                  <Highlight text={r.key === null ? rootName : String(r.key)} query={q} />
                </span>
                <span className="text-muted-foreground">: </span>
                {r.container ? (
                  <span className="text-muted-foreground">
                    {brackets[0]}
                    {!o && (
                      <>
                        <span className="mx-1 rounded bg-muted px-1 text-[11px] font-sans">
                          {r.size} {Array.isArray(r.value) ? (r.size === 1 ? "item" : "items") : r.size === 1 ? "key" : "keys"}
                        </span>
                        {brackets[1]}
                      </>
                    )}
                  </span>
                ) : (
                  <span className={tone(r.value)}>
                    <Highlight text={primitiveText(r.value)} query={q} />
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex min-w-0 items-center gap-2 border-t bg-muted/30 px-3 py-1.5">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" title={current.path || rootName}>
          {current.path || rootName}
        </code>
        {(["path", "value"] as const).map((what) => (
          <button
            key={what}
            type="button"
            onClick={() => copy(what)}
            aria-label={copied === what ? "Copied" : `Copy ${what}`}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {copied === what ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            {copied === what ? "Copied" : what === "path" ? "Path" : "Value"}
          </button>
        ))}
      </div>
    </div>
  );
}
