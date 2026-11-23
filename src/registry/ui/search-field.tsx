"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside } from "@/lib/hooks";

export interface SearchFieldProps {
  /** Terms matched as the user types. */
  suggestions?: string[];
  /** Recent searches shown before typing. */
  recent?: string[];
  /** Called on Enter or when a suggestion is picked. */
  onSearch?: (term: string) => void;
  /** Placeholder and accessible name. */
  placeholder?: string;
  /** Key that focuses the field from anywhere. */
  shortcut?: string | false;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Search box with a "/" shortcut, a clear button, recent searches and
 * live suggestions. onSearch fires on Enter or when a suggestion is picked.
 */
export function SearchField({
  suggestions = [],
  recent: recentProp = [],
  onSearch,
  placeholder = "Search…",
  shortcut = "/",
  className,
}: SearchFieldProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState(recentProp);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useClickOutside(root, () => setOpen(false), open);

  const matches = q ? suggestions.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const list = q ? matches : recent.slice(0, 5);
  const showPanel = open && list.length > 0;
  const side = useAutoSide(root, panel, showPanel);

  useEffect(() => {
    if (!shortcut) return;
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = /input|textarea|select/i.test(t.tagName) || t.isContentEditable;
      if (e.key === shortcut && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [shortcut]);
  useEffect(() => setActive(-1), [q]);

  const run = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setQ(t);
    setRecent((r) => [t, ...r.filter((x) => x !== t)].slice(0, 8));
    setOpen(false);
    onSearch?.(t);
  };

  const mark = (s: string) => {
    const i = s.toLowerCase().indexOf(q.toLowerCase());
    if (!q || i < 0) return s;
    return (
      <>
        {s.slice(0, i)}
        <span className="font-semibold text-foreground">{s.slice(i, i + q.length)}</span>
        {s.slice(i + q.length)}
      </>
    );
  };

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={input}
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => (setQ(e.target.value), setOpen(true))}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(list.length - 1, a + 1)));
            else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(-1, a - 1)));
            else if (e.key === "Enter") (e.preventDefault(), run(active >= 0 ? list[active] : q));
            else if (e.key === "Escape") q ? setQ("") : (setOpen(false), input.current!.blur());
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        {q ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => (setQ(""), input.current?.focus())}
            className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          shortcut && (
            <kbd className="grid h-5 min-w-5 place-items-center rounded border bg-muted px-1 text-[11px] text-muted-foreground">
              {shortcut}
            </kbd>
          )
        )}
      </div>
      {showPanel && (
        <div
          ref={panel}
          className={cn(
            "absolute z-50 w-full animate-in overflow-hidden rounded-xl border bg-popover p-1 shadow-lg shadow-black/10",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          )}
        >
          <div className="flex items-center justify-between px-2 pb-1 pt-1.5 text-xs text-muted-foreground">
            <span>{q ? "Suggestions" : "Recent"}</span>
            {!q && (
              <button type="button" onClick={() => setRecent([])} className="hover:text-foreground">
                Clear
              </button>
            )}
          </div>
          <ul role="listbox">
            {list.map((s, i) => (
              <li key={s} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onPointerMove={() => setActive(i)}
                  onClick={() => run(s)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground",
                    i === active && "bg-accent"
                  )}
                >
                  {q ? <Search className="size-3.5" /> : <Clock className="size-3.5" />}
                  <span className="truncate">{mark(s)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
