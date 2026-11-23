"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface SortableListProps<T extends { id: string | number; label?: string }> {
  /** Controlled items. */
  items?: T[];
  /** Initial items when uncontrolled. */
  defaultItems?: T[];
  /** Called with the new order. */
  onChange?: (items: T[]) => void;
  /** Renders a row's content. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Drag to reorder (mouse or touch), or focus a handle and use Alt+Up / Alt+Down.
 * items: [{ id, ... }]; renderItem(item) returns the row content.
 */
export function SortableList<T extends { id: string | number; label?: string }>({
  items: itemsProp,
  defaultItems,
  onChange,
  renderItem,
  className,
}: SortableListProps<T>) {
  const [items, setItems] = useControllable({ value: itemsProp, defaultValue: defaultItems ?? [], onChange });
  const [dragId, setDragId] = useState<T["id"] | null>(null);
  const [offset, setOffset] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const start = useRef(0);
  const [live, setLive] = useState("");

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setItems(next);
  };

  const onDown = (e: React.PointerEvent<HTMLElement>, id: T["id"]) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
    start.current = e.clientY;
    setOffset(0);
  };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (dragId == null) return;
    const dy = e.clientY - start.current;
    const rows = [...list.current!.children] as HTMLElement[];
    const i = items.findIndex((x) => x.id === dragId);
    const h = (rows[i]?.offsetHeight ?? 40) + 8;
    if (dy > h / 2 && i < items.length - 1) {
      move(i, i + 1);
      start.current += h;
      setOffset(dy - h);
    } else if (dy < -h / 2 && i > 0) {
      move(i, i - 1);
      start.current -= h;
      setOffset(dy + h);
    } else setOffset(dy);
  };
  const onUp = () => {
    setDragId(null);
    setOffset(0);
  };

  return (
    <>
      <ul ref={list} className={cn("grid w-full gap-2", className)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {items.map((it, i) => (
          <li
            key={it.id}
            className={cn(
              "surface flex items-center gap-3 rounded-xl border p-3 transition-[box-shadow,transform]",
              dragId === it.id ? "relative z-10 scale-[1.02] shadow-xl shadow-black/20 transition-none" : "duration-200"
            )}
            style={dragId === it.id ? { transform: `translateY(${offset}px) scale(1.02)` } : undefined}
          >
            <button
              type="button"
              aria-label={`Reorder ${it.label || it.id}. Use Alt and arrow keys.`}
              onPointerDown={(e) => onDown(e, it.id)}
              onKeyDown={(e) => {
                if (!e.altKey) return;
                const d = { ArrowUp: -1, ArrowDown: 1 }[e.key];
                if (!d) return;
                e.preventDefault();
                move(i, i + d);
                setLive(`Moved to position ${Math.min(items.length, Math.max(1, i + d + 1))}`);
                requestAnimationFrame(() => list.current?.children[i + d]?.querySelector("button")?.focus());
              }}
              className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
            <div className="min-w-0 flex-1">{renderItem(it, i)}</div>
          </li>
        ))}
      </ul>
      <span className="sr-only" aria-live="assertive">
        {live}
      </span>
    </>
  );
}
