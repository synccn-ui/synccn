"use client";

import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id?: string;
  label: string;
  icon?: React.ElementType;
  shortcut?: string;
  /** Extra words to match when searching. */
  keywords?: string;
  badge?: React.ReactNode;
  onSelect?: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

/** Fuzzy-ish scorer: substring beats subsequence; earlier matches score higher. */
export function score(text: string, query: string) {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const i = t.indexOf(q);
  if (i >= 0) return 2 - i / 100;
  let ti = 0;
  for (const ch of q) {
    ti = t.indexOf(ch, ti);
    if (ti < 0) return 0;
    ti++;
  }
  return 0.5;
}

export interface CommandProps {
  /** Grouped items to search. */
  groups: CommandGroup[];
  /** Search field placeholder. */
  placeholder?: string;
  /** Shown when nothing matches. */
  empty?: React.ReactNode;
  /** Focus the search field on mount. */
  autoFocus?: boolean;
  /** Called after any item runs. */
  onSelect?: (item: CommandItem) => void;
  /** Content below the list, e.g. keyboard hints. */
  footer?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Searchable command list with groups and keyboard navigation.
 * groups: [{ heading, items: [{ id, label, icon?, shortcut?, keywords?, onSelect }] }]
 */
export function Command({
  groups,
  placeholder = "Type a command or search…",
  empty = "No results. Try another search.",
  className,
  autoFocus = true,
  onSelect,
  footer,
}: CommandProps) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: g.items
            .map((it) => ({ it, s: score(`${it.label} ${it.keywords || ""}`, q) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .map((x) => x.it),
        }))
        .filter((g) => g.items.length),
    [groups, q]
  );
  const flat = filtered.flatMap((g) => g.items);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (it: CommandItem) => {
    it.onSelect?.();
    onSelect?.(it);
  };

  let idx = -1;
  return (
    <div className={cn("flex w-full flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground", className)}>
      <div className="flex items-center gap-2.5 border-b px-3.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus={autoFocus}
          data-autofocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Search commands"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => (a + 1) % Math.max(1, flat.length)));
            if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => (a - 1 + flat.length) % Math.max(1, flat.length)));
            if (e.key === "Enter" && flat[active]) (e.preventDefault(), run(flat[active]));
          }}
          className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </div>
      <div ref={list} role="listbox" className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
        {flat.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>}
        {filtered.map((g) => (
          <div key={g.heading} role="group" aria-label={g.heading} className="pb-1">
            <p className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">{g.heading}</p>
            {g.items.map((it) => {
              idx++;
              const i = idx;
              const Icon = it.icon;
              return (
                <div
                  key={it.id || it.label}
                  data-i={i}
                  role="option"
                  aria-selected={i === active}
                  onPointerMove={() => setActive(i)}
                  onClick={() => run(it)}
                  className={cn(
                    "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                    i === active && "bg-accent text-accent-foreground"
                  )}
                >
                  {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.badge}
                  {it.shortcut && <span className="text-xs text-muted-foreground">{it.shortcut}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}
