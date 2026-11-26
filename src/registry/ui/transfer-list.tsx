"use client";

import type * as React from "react";
import { useId, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Minus, Search } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface TransferItem {
  value: string;
  label: string;
  description?: string;
  /** Can't be moved either way. */
  disabled?: boolean;
}

export interface TransferListProps {
  /** Every item, on either side. */
  items: TransferItem[];
  /** Controlled values on the right, in order. */
  value?: string[];
  /** Values on the right at first, when uncontrolled. */
  defaultValue?: string[];
  /** Called with the values on the right. */
  onValueChange?: (value: string[]) => void;
  /**
   * Headings for the left and right lists.
   * @default ["Available", "Selected"]
   */
  titles?: [string, string];
  /**
   * Shows a search box above each list.
   * @default true
   */
  searchable?: boolean;
  /**
   * Height of each list, in pixels.
   * @default 240
   */
  height?: number;
  /** Extra classes for the root element. */
  className?: string;
}

interface PanelProps {
  title: string;
  items: TransferItem[];
  checked: Set<string>;
  onToggle: (value: string) => void;
  onToggleAll: (values: string[], on: boolean) => void;
  onMove: (values: string[]) => void;
  searchable: boolean;
  height: number;
}

function Panel({ title, items, checked, onToggle, onToggleAll, onMove, searchable, height }: PanelProps) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(0);
  const uid = useId();
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => i.label.toLowerCase().includes(t) || i.description?.toLowerCase().includes(t)) : items;
  }, [items, q]);
  const movable = shown.filter((i) => !i.disabled);
  const on = movable.filter((i) => checked.has(i.value)).length;
  const all = movable.length > 0 && on === movable.length;
  const f = Math.min(focus, shown.length - 1);

  const onKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const item = shown[f];
    if (e.key === "ArrowDown") (e.preventDefault(), setFocus(Math.min(shown.length - 1, f + 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setFocus(Math.max(0, f - 1)));
    else if (e.key === "Home") (e.preventDefault(), setFocus(0));
    else if (e.key === "End") (e.preventDefault(), setFocus(shown.length - 1));
    else if (e.key === " " && item && !item.disabled) (e.preventDefault(), onToggle(item.value));
    else if (e.key === "Enter" && item) {
      e.preventDefault();
      const picked = items.filter((i) => checked.has(i.value) && !i.disabled).map((i) => i.value);
      onMove(picked.length ? picked : item.disabled ? [] : [item.value]);
    } else if ((e.key === "a" || e.key === "A") && (e.metaKey || e.ctrlKey)) (e.preventDefault(), onToggleAll(movable.map((i) => i.value), !all));
  };

  return (
    <div className="grid min-w-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2.5 border-b px-3 py-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={all ? true : on ? "mixed" : false}
          aria-label={`Select all in ${title}`}
          disabled={!movable.length}
          onClick={() => onToggleAll(movable.map((i) => i.value), !all)}
          className={cn("grid size-4 shrink-0 place-items-center rounded border transition-colors disabled:opacity-40", on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}
        >
          {all ? <Check className="size-3" strokeWidth={3} /> : on ? <Minus className="size-3" strokeWidth={3} /> : null}
        </button>
        <p id={`${uid}-title`} className="min-w-0 flex-1 truncate text-sm font-medium">
          {title}
        </p>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{on ? `${on} / ${items.length}` : items.length}</span>
      </div>
      {searchable && (
        <label className="flex items-center gap-2 border-b px-3">
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label={`Search ${title}`} className="h-8 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
        </label>
      )}
      <ul
        role="listbox"
        aria-multiselectable
        aria-labelledby={`${uid}-title`}
        aria-activedescendant={shown[f] ? `${uid}-${f}` : undefined}
        tabIndex={0}
        onKeyDown={onKey}
        className="group/list overflow-auto p-1 outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
        style={{ height }}
      >
        {shown.length === 0 && <li className="grid h-full place-items-center px-3 text-center text-[13px] text-muted-foreground">{q ? "No matches" : "Nothing here"}</li>}
        {shown.map((i, n) => {
          const c = checked.has(i.value);
          return (
            <li
              key={i.value}
              id={`${uid}-${n}`}
              role="option"
              aria-selected={c}
              aria-disabled={i.disabled || undefined}
              onClick={() => (setFocus(n), !i.disabled && onToggle(i.value))}
              onDoubleClick={() => !i.disabled && onMove([i.value])}
              className={cn(
                "flex cursor-pointer select-none items-start gap-2.5 rounded-md px-2 py-1.5",
                n === f && "group-focus-visible/list:ring-2 group-focus-visible/list:ring-ring/50",
                c ? "bg-brand-soft" : "hover:bg-muted/60",
                i.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors", c ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")} aria-hidden>
                {c && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="grid min-w-0">
                <span className="truncate text-sm">{i.label}</span>
                {i.description && <span className="truncate text-xs text-muted-foreground">{i.description}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Two lists with checkboxes and buttons to move items between them: search each side,
 * select all, double-click or press Enter to move. Stacks on narrow screens.
 */
export function TransferList({ items, value, defaultValue = [], onValueChange, titles = ["Available", "Selected"], searchable = true, height = 240, className }: TransferListProps) {
  const [right, setRight] = useControllable<string[]>({ value, defaultValue, onChange: onValueChange });
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [announce, setAnnounce] = useState("");

  const rightSet = new Set(right);
  const leftItems = items.filter((i) => !rightSet.has(i.value));
  const byValue = new Map(items.map((i) => [i.value, i]));
  const rightItems = right.map((v) => byValue.get(v)).filter((i): i is TransferItem => !!i);

  const toggle = (v: string) =>
    setChecked((s) => {
      const n = new Set(s);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });
  const toggleAll = (vals: string[], on: boolean) =>
    setChecked((s) => {
      const n = new Set(s);
      vals.forEach((v) => (on ? n.add(v) : n.delete(v)));
      return n;
    });

  const moveRight = (vals: string[]) => {
    const add = vals.filter((v) => !rightSet.has(v) && !byValue.get(v)?.disabled);
    if (!add.length) return;
    setRight([...right, ...add]);
    toggleAll(add, false);
    setAnnounce(`Moved ${add.length} to ${titles[1]}`);
  };
  const moveLeft = (vals: string[]) => {
    const rem = new Set(vals.filter((v) => rightSet.has(v) && !byValue.get(v)?.disabled));
    if (!rem.size) return;
    setRight(right.filter((v) => !rem.has(v)));
    toggleAll([...rem], false);
    setAnnounce(`Moved ${rem.size} to ${titles[0]}`);
  };

  const leftChecked = leftItems.filter((i) => checked.has(i.value) && !i.disabled).map((i) => i.value);
  const rightChecked = rightItems.filter((i) => checked.has(i.value) && !i.disabled).map((i) => i.value);
  const btn = "grid size-8 place-items-center rounded-md border border-input bg-background shadow-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={cn("grid w-full items-center gap-3 text-left sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]", className)}>
      <Panel title={titles[0]} items={leftItems} checked={checked} onToggle={toggle} onToggleAll={toggleAll} onMove={moveRight} searchable={searchable} height={height} />
      <div className="flex justify-center gap-1.5 sm:flex-col" role="group" aria-label="Move items">
        <button type="button" className={btn} aria-label={`Move all to ${titles[1]}`} onClick={() => moveRight(leftItems.map((i) => i.value))} disabled={!leftItems.some((i) => !i.disabled)}>
          <ChevronsRight className="size-4 rotate-90 sm:rotate-0" />
        </button>
        <button type="button" className={btn} aria-label={`Move selected to ${titles[1]}`} onClick={() => moveRight(leftChecked)} disabled={!leftChecked.length}>
          <ChevronRight className="size-4 rotate-90 sm:rotate-0" />
        </button>
        <button type="button" className={btn} aria-label={`Move selected to ${titles[0]}`} onClick={() => moveLeft(rightChecked)} disabled={!rightChecked.length}>
          <ChevronLeft className="size-4 rotate-90 sm:rotate-0" />
        </button>
        <button type="button" className={btn} aria-label={`Move all to ${titles[0]}`} onClick={() => moveLeft(rightItems.map((i) => i.value))} disabled={!rightItems.some((i) => !i.disabled)}>
          <ChevronsLeft className="size-4 rotate-90 sm:rotate-0" />
        </button>
      </div>
      <Panel title={titles[1]} items={rightItems} checked={checked} onToggle={toggle} onToggleAll={toggleAll} onMove={moveLeft} searchable={searchable} height={height} />
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
