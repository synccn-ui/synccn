"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

function range(page: number, total: number, siblings: number) {
  const pages: (number | "…l" | "…r")[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (start > 2) pages.push("…l");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…r");
  if (total > 1) pages.push(total);
  return pages;
}

export interface PaginationProps {
  /** Number of pages. */
  total: number;
  /** Controlled current page (1-based). */
  page?: number;
  /** Initial page when uncontrolled. */
  defaultPage?: number;
  /** Called with the new page. */
  onPageChange?: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblings?: number;
  /** Extra classes for the root element. */
  className?: string;
}

export function Pagination({ total, page, defaultPage = 1, onPageChange, siblings = 1, className }: PaginationProps) {
  const [current, setCurrent] = useControllable({ value: page, defaultValue: defaultPage, onChange: onPageChange });
  const item =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        className={cn(item, "gap-1 pr-3 hover:bg-accent")}
        disabled={current <= 1}
        onClick={() => setCurrent(current - 1)}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      {range(current, total, siblings).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="grid size-9 place-items-center text-muted-foreground" aria-hidden>
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === current ? "page" : undefined}
            onClick={() => setCurrent(p)}
            className={cn(item, "tabular-nums", p === current ? "border bg-background shadow-xs" : "hover:bg-accent")}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className={cn(item, "gap-1 pl-3 hover:bg-accent")}
        disabled={current >= total}
        onClick={() => setCurrent(current + 1)}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
