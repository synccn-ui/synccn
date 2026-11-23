"use client";

import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside, useEscape } from "@/lib/hooks";

export interface MenubarItem {
  type?: "separator" | "checkbox";
  label?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
}

export interface MenubarMenu {
  label: string;
  items: MenubarItem[];
}

export interface MenubarProps {
  /** Top-level menus, left to right. */
  menus: MenubarMenu[];
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Desktop-app style menu bar. Once one menu is open, hovering the others
 * switches between them; Left/Right arrows move along the bar.
 * menus: [{ label, items: [...same item shape as DropdownMenu] }]
 */
export function Menubar({ menus, className }: MenubarProps) {
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const close = useCallback(() => setOpen(null), []);
  useClickOutside(root, close, open != null);
  useEscape(close, open != null);

  const move = (dir: number) => {
    const n = ((open ?? 0) + dir + menus.length) % menus.length;
    setOpen(n);
    btns.current[n]?.focus();
  };

  return (
    <div
      ref={root}
      role="menubar"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") (e.preventDefault(), move(1));
        if (e.key === "ArrowLeft") (e.preventDefault(), move(-1));
      }}
      className={cn("flex h-10 w-fit items-center gap-0.5 rounded-lg border bg-background p-1 shadow-xs", className)}
    >
      {menus.map((m, i) => (
        <div key={m.label} className="relative">
          <button
            ref={(el) => {
              btns.current[i] = el;
            }}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            onPointerEnter={() => open != null && setOpen(i)}
            onKeyDown={(e) => e.key === "ArrowDown" && (e.preventDefault(), setOpen(i))}
            className={cn(
              "h-8 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",
              open === i && "bg-accent"
            )}
          >
            {m.label}
          </button>
          {open === i && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-1.5 min-w-56 animate-in rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/10"
            >
              {m.items.map((it, k) =>
                it.type === "separator" ? (
                  <div key={k} className="-mx-1 my-1 h-px bg-border" />
                ) : (
                  <button
                    key={k}
                    type="button"
                    role={it.type === "checkbox" ? "menuitemcheckbox" : "menuitem"}
                    aria-checked={it.type === "checkbox" ? !!it.checked : undefined}
                    disabled={it.disabled}
                    onClick={() => {
                      if (it.type === "checkbox") it.onCheckedChange?.(!it.checked);
                      else {
                        it.onSelect?.();
                        close();
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:opacity-40"
                  >
                    <span className="grid size-4 place-items-center">
                      {it.type === "checkbox" && it.checked && <Check className="size-3.5" />}
                    </span>
                    <span className="flex-1">{it.label}</span>
                    {it.shortcut && <span className="text-xs text-muted-foreground">{it.shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
