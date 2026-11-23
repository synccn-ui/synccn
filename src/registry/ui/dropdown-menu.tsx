"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useEscape, usePresence } from "@/lib/hooks";

export interface DropdownMenuItem {
  type?: "separator" | "label" | "checkbox";
  label?: React.ReactNode;
  icon?: React.ElementType;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  submenu?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
}

export interface DropdownMenuProps {
  /** Element that opens the menu. */
  trigger: React.ReactNode;
  /** Menu entries. */
  items: DropdownMenuItem[];
  /** Which edge of the trigger the menu lines up with. */
  align?: "start" | "end";
  /** Extra classes for the menu panel. */
  contentClassName?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * items: [
 *   { label, icon?, shortcut?, onSelect?, destructive?, disabled? }
 *   | { type: "separator" } | { type: "label", label }
 *   | { type: "checkbox", label, checked, onCheckedChange }
 * ]
 */
export function DropdownMenu({ trigger, items, align = "start", className, contentClassName }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, menu, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const actionable = items.map((it, i) => ((!it.type || it.type === "checkbox") && !it.disabled ? i : null)).filter((i) => i != null);

  useEffect(() => {
    if (open) {
      setActive(-1);
      requestAnimationFrame(() => menu.current?.focus());
    }
  }, [open]);

  const select = (it: DropdownMenuItem) => {
    if (it.type === "checkbox") it.onCheckedChange?.(!it.checked);
    else {
      it.onSelect?.();
      setOpen(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    const pos = actionable.indexOf(active);
    if (e.key === "ArrowDown") (e.preventDefault(), setActive(actionable[(pos + 1) % actionable.length]));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive(actionable[(pos - 1 + actionable.length) % actionable.length]));
    else if (e.key === "Home") (e.preventDefault(), setActive(actionable[0]));
    else if (e.key === "End") (e.preventDefault(), setActive(actionable.at(-1) ?? -1));
    else if ((e.key === "Enter" || e.key === " ") && active >= 0) (e.preventDefault(), select(items[active]));
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className={cn("relative inline-flex", className)}>
      <span
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="contents"
      >
        {trigger}
      </span>
      {mounted && (
        <div
          ref={menu}
          role="menu"
          tabIndex={-1}
          onKeyDown={onKey}
          className={cn(
            "absolute z-50 min-w-52 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 outline-none",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "end" ? "right-0" : "left-0",
            closing ? "animate-out" : "animate-in",
            contentClassName
          )}
        >
          {items.map((it, i) => {
            if (it.type === "separator") return <div key={i} role="separator" className="-mx-1 my-1 h-px bg-border" />;
            if (it.type === "label")
              return (
                <div key={i} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {it.label}
                </div>
              );
            const Icon = it.icon;
            return (
              <div
                key={i}
                role={it.type === "checkbox" ? "menuitemcheckbox" : "menuitem"}
                aria-checked={it.type === "checkbox" ? !!it.checked : undefined}
                aria-disabled={it.disabled || undefined}
                onPointerMove={() => !it.disabled && setActive(i)}
                onPointerLeave={() => setActive(-1)}
                onClick={() => !it.disabled && select(it)}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm select-none [&_svg]:size-4",
                  active === i && (it.destructive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"),
                  it.destructive && "text-destructive",
                  it.disabled && "opacity-50"
                )}
              >
                {it.type === "checkbox" ? (
                  <span className="grid size-4 place-items-center">{it.checked && <Check className="text-primary" />}</span>
                ) : (
                  Icon && <Icon className={cn(!it.destructive && "text-muted-foreground")} />
                )}
                <span className="flex-1">{it.label}</span>
                {it.shortcut && <span className="text-xs tracking-wide text-muted-foreground">{it.shortcut}</span>}
                {it.submenu && <ChevronRight className="text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
