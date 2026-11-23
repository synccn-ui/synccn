"use client";

import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside, useEscape } from "@/lib/hooks";

export interface ContextMenuItem {
  type?: "separator";
  label?: React.ReactNode;
  icon?: React.ElementType;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface ContextMenuProps {
  /** Menu entries. */
  items: ContextMenuItem[];
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Right-click (or long-press) menu. items use the same shape as DropdownMenu. */
export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const close = useCallback(() => setPos(null), []);
  useClickOutside(menu, close, !!pos);
  useEscape(close, !!pos);

  const openAt = (clientX: number, clientY: number) => {
    const r = area.current!.getBoundingClientRect();
    setPos({ x: Math.min(clientX - r.left, r.width - 200), y: Math.min(clientY - r.top, r.height - 40) });
  };

  return (
    <div
      ref={area}
      onContextMenu={(e) => {
        e.preventDefault();
        openAt(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        press.current = setTimeout(() => openAt(t.clientX, t.clientY), 500);
      }}
      onTouchEnd={() => clearTimeout(press.current)}
      onTouchMove={() => clearTimeout(press.current)}
      className={cn("relative", className)}
    >
      {children}
      {pos && (
        <div
          ref={menu}
          role="menu"
          className="absolute z-50 min-w-48 animate-in rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
          style={{ left: Math.max(0, pos.x), top: Math.max(0, pos.y) }}
        >
          {items.map((it, i) =>
            it.type === "separator" ? (
              <div key={i} className="-mx-1 my-1 h-px bg-border" />
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  it.onSelect?.();
                  close();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:opacity-50 [&_svg]:size-4",
                  it.destructive && "text-destructive hover:bg-destructive/10"
                )}
              >
                {it.icon && <it.icon className={cn(!it.destructive && "text-muted-foreground")} />}
                <span className="flex-1">{it.label}</span>
                {it.shortcut && <span className="text-xs text-muted-foreground">{it.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
