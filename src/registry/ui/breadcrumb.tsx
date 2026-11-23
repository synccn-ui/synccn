import type * as React from "react";
import { Fragment } from "react";
import { ChevronRight, Slash } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbProps {
  /** Path from root to the current page (last item). */
  items: BreadcrumbItem[];
  /** Divider style. */
  separator?: "chevron" | "slash";
  /** Render links with your router's Link component. */
  renderLink?: (item: BreadcrumbItem, children: React.ReactNode) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** items: [{ label, href?, icon? }] — the last item is the current page. */
export function Breadcrumb({ items, separator = "chevron", className, renderLink }: BreadcrumbProps) {
  const Sep = separator === "slash" ? Slash : ChevronRight;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          const Icon = it.icon;
          const inner = (
            <>
              {Icon && <Icon className="size-3.5" />}
              {it.label}
            </>
          );
          return (
            <Fragment key={i}>
              <li className="inline-flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    {inner}
                  </span>
                ) : renderLink ? (
                  renderLink(it, inner)
                ) : (
                  <a href={it.href || "#"} className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                    {inner}
                  </a>
                )}
              </li>
              {!last && (
                <li aria-hidden className={cn("text-muted-foreground/60", separator === "slash" && "-rotate-12")}>
                  <Sep className="size-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
