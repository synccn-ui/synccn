"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Clock, Loader2, Search } from "lucide-react";
import { useFocusTrap, useIsClient, useLockScroll, usePresence } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { score } from "@/registry/ui/command";
import { Kbd } from "@/registry/ui/kbd";

export interface CommandItem {
  id: string;
  label: string;
  /** Second line, or the parent path in search results. */
  description?: string;
  icon?: React.ElementType;
  /** Keys shown on the right, e.g. ["⌘", "B"]. Display only. */
  shortcut?: string[];
  /** Extra words that should find this item. */
  keywords?: string[];
  /** Runs when chosen. Items with `items` open a sub-page instead. */
  onSelect?: () => void;
  /** Child commands, shown as their own page. */
  items?: CommandItem[];
}

export interface CommandProvider {
  id: string;
  /** Group heading. */
  heading: string;
  /** Fixed commands. */
  items?: CommandItem[];
  /** Results for a query, sync or async (e.g. a server search). Called only when the query isn't empty. */
  search?: (query: string) => CommandItem[] | Promise<CommandItem[]>;
}

export interface CommandCenterProps {
  /** Where commands come from. */
  providers: CommandProvider[];
  /** Called after any command is chosen (except opening a sub-page). */
  onSelect?: (item: CommandItem) => void;
  /** Search box placeholder. */
  placeholder?: string;
  /** Remember recently used commands under this localStorage key. */
  recentsKey?: string;
  /** How many recent commands to show. */
  maxRecents?: number;
  /** Focus the search box on mount. */
  autoFocus?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

type Row = CommandItem & { group: string; path?: string };
type Group = { heading: string; rows: Row[]; loading?: boolean };

/** Indexes of `query`'s characters in `text`: a run if it appears whole, else in order. */
function matches(text: string, query: string): number[] {
  if (!query) return [];
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const at = t.indexOf(q);
  if (at >= 0) return Array.from({ length: q.length }, (_, i) => at + i);
  const out: number[] = [];
  let from = 0;
  for (const ch of q) {
    const i = t.indexOf(ch, from);
    if (i < 0) return [];
    out.push(i);
    from = i + 1;
  }
  return out;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const hits = new Set(matches(text, query));
  if (!hits.size) return <>{text}</>;
  // Group neighbouring characters so each run is one text node or one <mark>.
  const runs: { hit: boolean; text: string }[] = [];
  [...text].forEach((ch, i) => {
    const hit = hits.has(i);
    const last = runs[runs.length - 1];
    if (last && last.hit === hit) last.text += ch;
    else runs.push({ hit, text: ch });
  });
  return (
    <>
      {runs.map((r, i) =>
        r.hit ? (
          <mark key={i} className="bg-transparent font-semibold text-foreground underline decoration-foreground/30 underline-offset-2">
            {r.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{r.text}</React.Fragment>
        )
      )}
    </>
  );
}

function flatten(items: CommandItem[], path: string[] = []): (CommandItem & { path?: string })[] {
  return items.flatMap((it) => [{ ...it, path: path.length ? path.join(" › ") : undefined }, ...(it.items ? flatten(it.items, [...path, it.label]) : [])]);
}

const readRecents = (key?: string): string[] => {
  if (!key || typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as string[];
  } catch {
    return [];
  }
};

/**
 * Command palette engine: grouped results from several providers (fixed or async),
 * nested pages, recent commands, match highlighting and full keyboard control.
 * Use it inline, or in CommandCenterDialog for a ⌘K overlay.
 */
export function CommandCenter({ providers, onSelect, placeholder = "Type a command or search…", recentsKey, maxRecents = 5, autoFocus = true, className }: CommandCenterProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState<CommandItem[]>([]);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const [remote, setRemote] = useState<Record<string, CommandItem[]>>({});
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  useEffect(() => setRecents(readRecents(recentsKey)), [recentsKey]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, stack.length]);

  // Async providers: debounce, and ignore answers to queries that have since changed.
  useEffect(() => {
    const q = query.trim();
    const async = providers.filter((p) => p.search);
    if (!q || stack.length || !async.length) {
      setRemote({});
      setPending(new Set());
      return;
    }
    let live = true;
    setPending(new Set(async.map((p) => p.id)));
    const t = setTimeout(() => {
      for (const p of async) {
        Promise.resolve(p.search?.(q))
          .catch(() => [] as CommandItem[])
          .then((items) => {
            if (!live) return;
            setRemote((r) => ({ ...r, [p.id]: items ?? [] }));
            setPending((s) => {
              const n = new Set(s);
              n.delete(p.id);
              return n;
            });
          });
      }
    }, 150);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, providers, stack.length]);

  const all = useMemo(() => providers.flatMap((p) => flatten(p.items ?? []).map((it) => ({ ...it, group: p.heading }))), [providers]);

  const groups = useMemo<Group[]>(() => {
    const q = query.trim();
    const rank = (rows: Row[]): Row[] =>
      rows
        .map((r) => ({ r, s: Math.max(score(r.label, q), ...(r.keywords ?? []).map((k) => score(k, q) * 0.9)) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.r);
    const page = stack[stack.length - 1];
    if (page) return [{ heading: page.label, rows: rank((page.items ?? []).map((it) => ({ ...it, group: page.label }))) }];
    if (!q) {
      const recent = recents.map((id) => all.find((r) => r.id === id)).filter((r): r is Row => !!r).slice(0, maxRecents);
      return [
        ...(recent.length ? [{ heading: "Recent", rows: recent.map((r) => ({ ...r, group: "Recent", icon: r.icon ?? Clock })) }] : []),
        ...providers.filter((p) => p.items?.length).map((p) => ({ heading: p.heading, rows: (p.items ?? []).map((it) => ({ ...it, group: p.heading })) })),
      ];
    }
    return [
      ...providers.filter((p) => p.items?.length).map((p) => ({ heading: p.heading, rows: rank(all.filter((r) => r.group === p.heading)) })),
      ...providers.filter((p) => p.search).map((p) => ({ heading: p.heading, rows: (remote[p.id] ?? []).map((it) => ({ ...it, group: p.heading })), loading: pending.has(p.id) })),
    ].filter((g: Group) => g.rows.length || g.loading);
  }, [query, stack, recents, all, providers, remote, pending, maxRecents]);

  const rows = groups.flatMap((g) => g.rows);
  const current = Math.min(active, Math.max(0, rows.length - 1));
  useEffect(() => setActive(0), [query, stack.length]);
  useEffect(() => {
    document.getElementById(`${listId}-${current}`)?.scrollIntoView({ block: "nearest" });
  }, [current, listId]);

  const choose = (r: Row) => {
    if (r.items?.length) {
      setStack((s) => [...s, r]);
      setQuery("");
      return;
    }
    r.onSelect?.();
    onSelect?.(r);
    const next = [r.id, ...recents.filter((x) => x !== r.id)].slice(0, 20);
    setRecents(next);
    if (recentsKey) {
      try {
        window.localStorage.setItem(recentsKey, JSON.stringify(next));
      } catch {
        /* storage blocked: recents last for this visit */
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!rows.length) return;
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length);
    } else if (e.key === "Home" && e.ctrlKey) {
      setActive(0);
    } else if (e.key === "End" && e.ctrlKey) {
      setActive(rows.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rows[current]) choose(rows[current]);
    } else if ((e.key === "Backspace" && !query) || (e.key === "Escape" && stack.length)) {
      if (stack.length) {
        e.preventDefault();
        e.stopPropagation();
        setStack((s) => s.slice(0, -1));
      }
    }
  };

  let index = -1;
  return (
    <div className={cn("flex max-h-[min(70vh,520px)] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg", className)} onKeyDown={onKeyDown}>
      <div className="flex items-center gap-2 border-b px-3">
        {stack.length > 0 ? (
          <button type="button" aria-label="Back" onClick={() => setStack((s) => s.slice(0, -1))} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <ChevronLeft className="size-4" />
          </button>
        ) : (
          <Search className="size-4 shrink-0 text-muted-foreground" />
        )}
        {stack.length > 0 && <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{stack.map((s) => s.label).join(" › ")}</span>}
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={rows.length ? `${listId}-${current}` : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={stack.length ? `Search ${stack[stack.length - 1].label.toLowerCase()}…` : placeholder}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div id={listId} role="listbox" aria-label="Commands" className="min-h-0 flex-1 overflow-y-auto p-1.5 scrollbar-thin">
        {rows.length === 0 && !groups.some((g) => g.loading) && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for "{query}".</p>}
        {groups.map((g) => (
          <div key={g.heading} role="group" aria-label={g.heading} className="pb-1">
            <p className="flex items-center gap-2 px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">
              {g.heading}
              {g.loading && <Loader2 className="size-3 animate-spin" aria-label="Searching" />}
            </p>
            {g.rows.map((r) => {
              index++;
              const i = index;
              const Icon = r.icon;
              return (
                <div
                  key={`${g.heading}-${r.id}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === current}
                  onPointerMove={() => i !== current && setActive(i)}
                  onClick={() => choose(r)}
                  className={cn("flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm", i === current && "bg-accent text-accent-foreground")}
                >
                  {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      <Highlight text={r.label} query={stack.length ? query : query.trim()} />
                    </span>
                    {(r.description || r.path) && <span className="block truncate text-xs text-muted-foreground">{r.path ?? r.description}</span>}
                  </span>
                  {r.shortcut && (
                    <span className="flex gap-1">
                      {r.shortcut.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  )}
                  {r.items?.length ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd> run
        </span>
        {stack.length > 0 && (
          <span className="flex items-center gap-1">
            <Kbd>⌫</Kbd> back
          </span>
        )}
      </div>
    </div>
  );
}

export interface CommandCenterDialogProps extends CommandCenterProps {
  /** Controlled open state. */
  open: boolean;
  /** Called to open or close. */
  onOpenChange: (open: boolean) => void;
  /** Open with ⌘K / Ctrl+K. Default true. */
  hotkey?: boolean;
}

/** CommandCenter in a centred overlay, with ⌘K to open, Escape to close and focus kept inside. */
export function CommandCenterDialog({ open, onOpenChange, hotkey = true, onSelect, ...props }: CommandCenterDialogProps) {
  const client = useIsClient();
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open);
  useLockScroll(open);
  useFocusTrap(panel, open);
  useEffect(() => {
    if (!hotkey) return;
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [hotkey, open, onOpenChange]);
  if (!client || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid items-start justify-items-center p-4 pt-[12vh]">
      <div aria-hidden className={cn("absolute inset-0 bg-black/50 backdrop-blur-[2px]", closing ? "animate-out" : "animate-fade")} onClick={() => onOpenChange(false)} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Command center"
        className={cn("relative w-full max-w-xl", closing ? "animate-out" : "animate-in")}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !e.defaultPrevented) onOpenChange(false);
        }}
      >
        <CommandCenter
          {...props}
          onSelect={(item) => {
            onSelect?.(item);
            onOpenChange(false);
          }}
        />
      </div>
    </div>,
    document.body
  );
}
