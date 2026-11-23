"use client";

import type * as React from "react";
import { useState } from "react";
import { ChevronRight, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/registry/ui/tooltip";

export interface SidebarItem {
  label: string;
  icon: React.ElementType;
  badge?: React.ReactNode;
  children?: { label: string }[];
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  /** Navigation groups. */
  groups: SidebarGroup[];
  /** Shown at the top (hidden when collapsed). */
  header?: React.ReactNode;
  /** Shown at the bottom; a function receives the collapsed state. */
  footer?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  /** Start in icon-only mode. */
  defaultCollapsed?: boolean;
  /** Label of the item active at first. */
  active?: string;
  /** Called when an item is chosen. */
  onSelect?: (label: string) => void;
  /** Main content; a function receives the active label. */
  children?: React.ReactNode | ((active: string) => React.ReactNode);
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Collapsible app sidebar. Collapsed mode shows icons with tooltips.
 * groups: [{ label, items: [{ label, icon, badge?, children?: [{ label }] }] }]
 */
export function Sidebar({
  groups,
  header,
  footer,
  defaultCollapsed = false,
  active: activeProp,
  onSelect,
  className,
  children,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [active, setActive] = useState(activeProp || groups[0]?.items[0]?.label);
  const [expanded, setExpanded] = useState(() => new Set<string>());
  const pick = (label: string) => {
    setActive(label);
    onSelect?.(label);
  };

  return (
    <div className={cn("flex w-full overflow-hidden rounded-2xl border bg-background", className)}>
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r bg-muted/30 transition-[width] duration-300 ease-[cubic-bezier(.3,.9,.3,1)]",
          collapsed ? "w-[60px]" : "w-60"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-3">
          {!collapsed && <div className="min-w-0 flex-1 truncate">{header}</div>}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-none">
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <p className={cn("px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground transition-opacity", collapsed && "opacity-0")}>
                {g.label}
              </p>
              {g.items.map((it) => {
                const isOpen = expanded.has(it.label);
                const btn = (
                  <button
                    type="button"
                    onClick={() => {
                      if (it.children && !collapsed)
                        setExpanded((s) => {
                          const n = new Set(s);
                          n.has(it.label) ? n.delete(it.label) : n.add(it.label);
                          return n;
                        });
                      else pick(it.label);
                    }}
                    aria-current={active === it.label ? "page" : undefined}
                    aria-expanded={it.children ? isOpen : undefined}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                      active === it.label
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <it.icon className="size-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{it.label}</span>
                        {it.badge && (
                          <span className="rounded-full bg-primary px-1.5 text-[11px] font-medium leading-5 text-primary-foreground">
                            {it.badge}
                          </span>
                        )}
                        {it.children && <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />}
                      </>
                    )}
                  </button>
                );
                return (
                  <div key={it.label}>
                    {collapsed ? (
                      <Tooltip content={it.label} side="right">
                        {btn}
                      </Tooltip>
                    ) : (
                      btn
                    )}
                    {it.children && isOpen && !collapsed && (
                      <div className="ml-[18px] grid animate-fade gap-0.5 border-l py-1 pl-3">
                        {it.children.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            onClick={() => pick(c.label)}
                            className={cn(
                              "rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                              active === c.label ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        {footer && <div className="border-t p-2">{typeof footer === "function" ? footer(collapsed) : footer}</div>}
      </aside>
      <div className="min-w-0 flex-1">{typeof children === "function" ? children(active) : children}</div>
    </div>
  );
}
