"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** One collapsible section. */
export interface AccordionItem {
  /** Unique key for the section. */
  value: string;
  /** Heading shown in the trigger. */
  title: React.ReactNode;
  /** Body shown when the section is open. */
  content: React.ReactNode;
}

export interface AccordionProps {
  /** Sections to render, in order. */
  items: AccordionItem[];
  /** Whether one or several sections can be open at once. */
  type?: "single" | "multiple";
  /** Values of the sections open on first render. */
  defaultValue?: string[];
  /** In "single" mode, whether the open section can be closed again. */
  collapsible?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * items: [{ value, title, content }]
 * type "single" keeps one panel open; "multiple" allows many.
 */
export function Accordion({ items, type = "single", defaultValue = [], collapsible = true, className }: AccordionProps) {
  const [open, setOpen] = useState(() => new Set<string>(defaultValue));
  const id = useId();

  const toggle = (v: string) =>
    setOpen((prev) => {
      const next = new Set(type === "single" ? [] : prev);
      if (prev.has(v)) {
        if (type === "single" && !collapsible) next.add(v);
        else next.delete(v);
      } else next.add(v);
      return next;
    });

  return (
    <div className={cn("w-full divide-y border-y", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.value);
        return (
          <div key={item.value}>
            <h3>
              <button
                type="button"
                id={`${id}-h-${item.value}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-c-${item.value}`}
                onClick={() => toggle(item.value)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-2 focus-visible:outline-ring"
              >
                {item.title}
                <ChevronDown
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <div
              id={`${id}-c-${item.value}`}
              role="region"
              aria-labelledby={`${id}-h-${item.value}`}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.3,.9,.3,1)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
