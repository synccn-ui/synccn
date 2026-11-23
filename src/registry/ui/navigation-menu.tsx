"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside, useEscape } from "@/lib/hooks";

export interface NavigationLink {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ElementType;
}

export interface NavigationItem {
  label: string;
  href?: string;
  /** Links shown in the dropdown panel. */
  links?: NavigationLink[];
  /** Highlighted tile on the left of the panel. */
  featured?: { title: string; description?: string };
}

export interface NavigationMenuProps {
  /** Top-level items. */
  items: NavigationItem[];
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Site navigation with dropdown panels (a mega menu on wide screens).
 * items: [{ label, href? } | { label, links: [{ title, description, href, icon? }], featured? }]
 */
export function NavigationMenu({ items, className }: NavigationMenuProps) {
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useClickOutside(root, () => setOpen(null), open != null);
  useEscape(() => setOpen(null), open != null);
  const enter = (i: number) => {
    clearTimeout(timer.current);
    setOpen(i);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(null), 160);
  };

  return (
    <nav ref={root} aria-label="Main" className={cn("relative h-fit self-start", className)} onPointerLeave={leave}>
      <ul className="flex items-center gap-0.5">
        {items.map((it, i) => (
          <li key={it.label}>
            {it.links ? (
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                onPointerEnter={() => enter(i)}
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
                  open === i && "bg-accent"
                )}
              >
                {it.label}
                <ChevronDown
                  className={cn("size-3.5 text-muted-foreground transition-transform duration-200", open === i && "rotate-180")}
                />
              </button>
            ) : (
              <a
                href={it.href || "#"}
                onClick={(e) => e.preventDefault()}
                onPointerEnter={() => setOpen(null)}
                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                {it.label}
              </a>
            )}
          </li>
        ))}
      </ul>
      {open != null && items[open]?.links && (
        <div onPointerEnter={() => clearTimeout(timer.current)} className="absolute left-0 top-full z-50 pt-2">
          <div
            key={open}
            className="grid w-[min(560px,calc(100vw-2rem))] animate-in gap-1 rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl shadow-black/10 sm:grid-cols-[200px_1fr]"
          >
            {items[open].featured && (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hidden flex-col justify-end rounded-xl bg-gradient-to-br from-foreground/[0.08] to-foreground/[0.02] p-4 sm:flex"
              >
                <p className="font-semibold">{items[open].featured.title}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{items[open].featured.description}</p>
              </a>
            )}
            <ul className={cn("grid gap-0.5", !items[open].featured && "sm:col-span-2 sm:grid-cols-2")}>
              {items[open].links.map((l) => (
                <li key={l.title}>
                  <a
                    href={l.href || "#"}
                    onClick={(e) => e.preventDefault()}
                    className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent"
                  >
                    {l.icon && (
                      <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-background">
                        <l.icon className="size-4" />
                      </span>
                    )}
                    <span className="grid gap-0.5">
                      <span className="text-sm font-medium">{l.title}</span>
                      <span className="line-clamp-2 text-[13px] text-muted-foreground">{l.description}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
