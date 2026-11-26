"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface VirtualListProps<T> {
  /** Every item. Only the ones in view are rendered. */
  items: T[];
  /** Height of each row in pixels. Rows must all be this tall. */
  itemHeight: number;
  /**
   * Height of the scrolling area in pixels.
   * @default 400
   */
  height?: number;
  /**
   * Extra rows rendered above and below the view, so fast scrolling doesn't flash.
   * @default 6
   */
  overscan?: number;
  /** Renders one row. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Stable key for a row. Defaults to its index. */
  getKey?: (item: T, index: number) => React.Key;
  /** Scrolls to this row when it changes. */
  scrollToIndex?: number;
  /** Called with the first and last rendered row as you scroll. */
  onRangeChange?: (range: { start: number; end: number }) => void;
  /** Shown when there are no items. */
  empty?: React.ReactNode;
  /** Accessible name for the list. */
  "aria-label"?: string;
  /** Extra classes for the scrolling element. */
  className?: string;
}

/**
 * Renders only the rows in view, so a list of 100,000 items scrolls as smoothly as 20.
 * No dependencies: fixed row heights, overscan, scroll-to-row and correct list semantics.
 */
export function VirtualList<T>({ items, itemHeight, height = 400, overscan = 6, renderItem, getKey, scrollToIndex, onRangeChange, empty, "aria-label": ariaLabel, className }: VirtualListProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const start = Math.max(0, Math.floor(top / itemHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((top + height) / itemHeight) + overscan);

  useEffect(() => {
    if (scrollToIndex == null || !ref.current) return;
    const el = ref.current;
    const y = scrollToIndex * itemHeight;
    if (y < el.scrollTop || y + itemHeight > el.scrollTop + height) el.scrollTo({ top: Math.max(0, y - height / 2 + itemHeight / 2) });
  }, [scrollToIndex, itemHeight, height]);

  useEffect(() => {
    onRangeChange?.({ start, end });
  }, [start, end]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the scroll position valid when the list shrinks (after filtering, say).
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollTop > Math.max(0, items.length * itemHeight - height)) setTop(el.scrollTop);
  }, [items.length, itemHeight, height]);

  return (
    <div ref={ref} onScroll={(e) => setTop(e.currentTarget.scrollTop)} tabIndex={0} aria-label={ariaLabel} role="list" className={cn("relative overflow-y-auto overscroll-contain outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]", className)} style={{ height }}>
      {items.length === 0 && empty}
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {items.slice(start, end).map((item, k) => {
          const i = start + k;
          return (
            <div key={getKey ? getKey(item, i) : i} role="listitem" aria-setsize={items.length} aria-posinset={i + 1} className="absolute inset-x-0" style={{ top: i * itemHeight, height: itemHeight }}>
              {renderItem(item, i)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
