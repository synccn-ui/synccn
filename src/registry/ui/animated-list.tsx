"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedListProps<T extends object> {
  /** Items to cycle through. */
  items: T[];
  /** Milliseconds between new items. */
  interval?: number;
  /** Most items visible at once. */
  max?: number;
  /** Renders one item. */
  renderItem: (item: T) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Reveals items one by one, newest on top, like a live activity feed. */
export function AnimatedList<T extends object>({ items, interval = 1600, max = 5, renderItem, className }: AnimatedListProps<T>) {
  const [shown, setShown] = useState<(T & { _k: string })[]>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      const item = items[i % items.length];
      setShown((prev) => [{ ...item, _k: `${i}-${Date.now()}` }, ...prev].slice(0, max));
      i++;
    }, interval);
    return () => clearInterval(t);
  }, [items, interval, max]);

  return (
    <ul className={cn("flex flex-col gap-2.5", className)} aria-live="polite">
      {shown.map((it, idx) => (
        <li
          key={it._k}
          className="origin-top animate-[enter_.45s_cubic-bezier(.3,1.4,.5,1)] transition-opacity duration-500"
          style={{ opacity: 1 - idx * 0.14 }}
        >
          {renderItem(it)}
        </li>
      ))}
    </ul>
  );
}
