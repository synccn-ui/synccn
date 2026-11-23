"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DockProps {
  /** Apps in the dock. */
  items: { label: string; icon: React.ElementType; onClick?: () => void; active?: boolean }[];
  /** Icon size at rest, in pixels. */
  base?: number;
  /** Icon size under the pointer, in pixels. */
  magnify?: number;
  /** Pixels from the pointer where magnification starts. */
  distance?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Dock with magnification: icons grow based on their distance to the pointer.
 * items: [{ label, icon, onClick?, active? }]
 */
export function Dock({ items, base = 40, magnify = 64, distance = 120, className }: DockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mx, setMx] = useState<number | null>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  const sizeFor = (i: number) => {
    if (mx == null || !btns.current[i]) return base;
    const r = btns.current[i].getBoundingClientRect();
    const d = Math.abs(mx - (r.left + r.width / 2));
    if (d > distance) return base;
    const t = Math.cos((d / distance) * (Math.PI / 2));
    return base + (magnify - base) * t;
  };

  return (
    <div
      ref={ref}
      onPointerMove={(e) => e.pointerType === "mouse" && setMx(e.clientX)}
      onPointerLeave={() => setMx(null)}
      className={cn(
        "mx-auto flex h-[58px] items-end gap-2 rounded-2xl border bg-background/70 px-2.5 pb-2 shadow-lg shadow-black/5 backdrop-blur-md",
        className
      )}
    >
      {items.map((it, i) => {
        const s = sizeFor(i);
        const Icon = it.icon;
        return (
          <button
            key={it.label}
            ref={(el) => {
              btns.current[i] = el;
            }}
            type="button"
            aria-label={it.label}
            onClick={it.onClick}
            className="group relative grid shrink-0 place-items-center rounded-xl border bg-card text-foreground transition-[width,height] duration-100 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            style={{ width: s, height: s }}
          >
            <Icon style={{ width: s * 0.45, height: s * 0.45 }} />
            <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[11px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {it.label}
            </span>
            {it.active && <span className="absolute -bottom-1.5 size-1 rounded-full bg-foreground/70" />}
          </button>
        );
      })}
    </div>
  );
}
