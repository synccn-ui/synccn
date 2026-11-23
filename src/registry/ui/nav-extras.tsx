"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside, useEscape } from "@/lib/hooks";

export interface TabBarProps {
  /** Tabs. */
  items: { value: string; label: string; icon: React.ElementType; badge?: number }[];
  /** Controlled active tab. */
  value?: string;
  /** Called when a tab is chosen. */
  onValueChange?: (value: string) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Mobile bottom tab bar with an animated active pill. items: [{ value, label, icon, badge? }] */
export function TabBar({ items, value, onValueChange, className }: TabBarProps) {
  const [inner, setInner] = useState(items[0]?.value);
  const cur = value ?? inner;
  const pick = (v: string) => (setInner(v), onValueChange?.(v));
  return (
    <nav
      aria-label="Tabs"
      className={cn(
        "flex w-full items-stretch justify-around border-t bg-background/90 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur",
        className
      )}
    >
      {items.map((it) => {
        const on = it.value === cur;
        return (
          <button
            key={it.value}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => pick(it.value)}
            className="group relative flex min-w-14 flex-1 flex-col items-center gap-1 text-[11px] font-medium"
          >
            <span
              className={cn(
                "relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-300",
                on ? "bg-accent text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              <it.icon className={cn("size-5 transition-transform duration-300", on && "scale-110")} />
              {!!it.badge && it.badge > 0 && (
                <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] text-white">
                  {it.badge}
                </span>
              )}
            </span>
            <span className={on ? "text-foreground" : "text-muted-foreground"}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export interface TableOfContentsProps {
  /** Sections, matched to elements by id. */
  items: { id: string; label: string; level?: 1 | 2 }[];
  /** Scroll container to watch. Defaults to the page. */
  root?: React.RefObject<HTMLElement | null>;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Table of contents that highlights the section in view (scrollspy).
 * items: [{ id, label, level? }]; root: optional scroll container ref.
 */
export function TableOfContents({ items, root, className }: TableOfContentsProps) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { root: root?.current || null, rootMargin: "0px 0px -65% 0px" }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items, root]);
  return (
    <nav aria-label="On this page" className={cn("grid gap-0.5 border-l text-sm", className)}>
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            setActive(i.id);
          }}
          className={cn(
            "-ml-px border-l-2 py-1 transition-colors",
            i.level === 2 ? "pl-6" : "pl-3",
            active === i.id
              ? "border-foreground font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {i.label}
        </a>
      ))}
    </nav>
  );
}

export interface BackToTopProps {
  /** Scroll container to watch. Defaults to the page. */
  target?: React.RefObject<HTMLElement | null>;
  /** Pixels scrolled before the button appears. */
  threshold?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Appears after scrolling down; scrolls back to the top. Pass a container ref, or it watches the window. */
export function BackToTop({ target, threshold = 300, className }: BackToTopProps) {
  const [show, setShow] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = target?.current;
    const src = el || window;
    const on = () => {
      const y = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - innerHeight;
      setShow(y > threshold);
      setP(max > 0 ? y / max : 0);
    };
    on();
    src.addEventListener("scroll", on, { passive: true });
    return () => src.removeEventListener("scroll", on);
  }, [target, threshold]);
  const c = 2 * Math.PI * 20;
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => (target?.current || window).scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "grid size-11 place-items-center rounded-full border bg-background shadow-lg transition-all duration-300 hover:bg-accent",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        className
      )}
    >
      <svg className="absolute size-11 -rotate-90" viewBox="0 0 44 44" aria-hidden>
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          strokeWidth="2"
          className="stroke-foreground"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <ArrowUp className="size-4" />
    </button>
  );
}

export interface SpeedDialProps {
  /** Secondary actions, top to bottom. */
  actions: { label: string; icon: React.ElementType; onClick?: () => void }[];
  /** Extra classes for the root element. */
  className?: string;
}

/** Floating action button that fans out secondary actions. actions: [{ label, icon, onClick }] */
export function SpeedDial({ actions, className }: SpeedDialProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);
  return (
    <div ref={root} className={cn("relative flex flex-col items-end gap-2", className)}>
      <ul className="flex flex-col items-end gap-2" aria-hidden={!open}>
        {actions.map((a, i) => (
          <li
            key={a.label}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
            )}
            style={{ transitionDelay: open ? `${(actions.length - 1 - i) * 40}ms` : "0ms" }}
          >
            <span className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow">{a.label}</span>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              aria-label={a.label}
              onClick={() => (a.onClick?.(), setOpen(false))}
              className="grid size-10 place-items-center rounded-full border bg-background shadow-md hover:bg-accent"
            >
              <a.icon className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close actions" : "Open actions"}
        onClick={() => setOpen(!open)}
        className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform active:scale-95"
      >
        <Plus className={cn("size-6 transition-transform duration-300", open && "rotate-45")} />
      </button>
    </div>
  );
}

export interface LoadMoreProps {
  /** Loads the next page. Return a promise to show the loading state. */
  onLoad?: () => void | Promise<void>;
  /** False shows the end-of-list message. */
  hasMore?: boolean;
  /** Button text while loading. */
  loadingLabel?: string;
  /** Message when there's nothing left. */
  doneLabel?: string;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** "Load more" button for long lists, with a loading state and an end-of-list message. */
export function LoadMore({
  onLoad,
  hasMore = true,
  loadingLabel = "Loading…",
  doneLabel = "You've reached the end",
  children = "Load more",
  className,
}: LoadMoreProps) {
  const [loading, setLoading] = useState(false);
  if (!hasMore) return <p className={cn("py-2 text-center text-sm text-muted-foreground", className)}>{doneLabel}</p>;
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onLoad?.();
        } finally {
          setLoading(false);
        }
      }}
      className={cn(
        "mx-auto flex h-9 items-center gap-2 rounded-full border bg-background px-5 text-sm font-medium hover:bg-accent disabled:opacity-70",
        className
      )}
    >
      {loading && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
