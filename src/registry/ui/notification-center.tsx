"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useEscape, usePresence } from "@/lib/hooks";

export interface NotificationItem {
  id: string | number;
  title: React.ReactNode;
  body?: React.ReactNode;
  time: string;
  read?: boolean;
  icon?: React.ElementType;
  avatar?: React.ReactNode;
}

export interface NotificationCenterProps {
  /** Initial notifications. */
  items: NotificationItem[];
  /** Which edge of the bell the panel lines up with. */
  align?: "start" | "end";
  /** Shows a settings button that calls this. */
  onOpenSettings?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Bell button with an unread badge that opens a panel of notifications,
 * with All/Unread tabs, mark-as-read on click and "Mark all as read".
 * items: [{ id, title, body?, time, read?, icon?, avatar? }]
 */
export function NotificationCenter({ items: initial, align = "end", onOpenSettings, className }: NotificationCenterProps) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, panel, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const unread = items.filter((i) => !i.read).length;
  const shown = tab === "unread" ? items.filter((i) => !i.read) : items;
  const markRead = (id: NotificationItem["id"]) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));

  return (
    <div ref={root} className={cn("relative inline-flex h-fit self-start", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative grid size-10 place-items-center rounded-full border bg-background hover:bg-accent"
      >
        <Bell className={cn("size-[18px]", unread && "origin-top animate-[ring_1.2s_ease-in-out_2]")} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-semibold tabular-nums text-white ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {mounted && (
        <div
          ref={panel}
          className={cn(
            "absolute z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl shadow-black/15",
            align === "end" ? "right-0" : "left-0",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            closing ? "animate-out" : "animate-in"
          )}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
            <p className="font-semibold">Notifications</p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!unread}
                onClick={() => setItems((xs) => xs.map((x) => ({ ...x, read: true })))}
                className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                <CheckCheck className="size-3.5" /> Mark all as read
              </button>
              {onOpenSettings && (
                <button
                  type="button"
                  aria-label="Notification settings"
                  onClick={onOpenSettings}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Settings className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <div role="tablist" className="flex gap-4 border-b px-4 text-sm">
            {[
              ["all", "All", items.length],
              ["unread", "Unread", unread],
            ].map(([id, label, n]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id as string)}
                className={cn(
                  "relative pb-2 font-medium transition-colors",
                  tab === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label} <span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums">{n}</span>
                {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />}
              </button>
            ))}
          </div>
          <ul className="max-h-80 overflow-y-auto scrollbar-thin">
            {shown.length === 0 && (
              <li className="grid place-items-center gap-2 px-6 py-10 text-center">
                <CheckCheck className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">You're all caught up</p>
                <p className="text-xs text-muted-foreground">New notifications will show up here.</p>
              </li>
            )}
            {shown.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/50",
                    !n.read && "bg-accent/25"
                  )}
                >
                  <span className="shrink-0">
                    {n.avatar ||
                      (n.icon && (
                        <span className="grid size-9 place-items-center rounded-full border bg-background">
                          <n.icon className="size-4" />
                        </span>
                      ))}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="text-sm">{n.title}</span>
                    {n.body && <span className="line-clamp-2 text-[13px] text-muted-foreground">{n.body}</span>}
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style>{`@keyframes ring{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-4deg)}}`}</style>
    </div>
  );
}
