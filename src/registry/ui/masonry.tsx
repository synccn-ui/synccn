import type * as React from "react";
import { Children } from "react";
import { cn } from "@/lib/utils";

export interface MasonryProps {
  /** Items of any height. */
  children?: React.ReactNode;
  /**
   * Narrowest a column may get, in pixels. The number of columns follows from the width.
   * @default 220
   */
  columnWidth?: number;
  /**
   * Space between items, in pixels.
   * @default 12
   */
  gap?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Pinterest-style layout for items of different heights, in pure CSS (so it works on the
 * server and needs no measuring). Items flow down each column, then across.
 */
export function Masonry({ children, columnWidth = 220, gap = 12, className }: MasonryProps) {
  return (
    <div className={cn("w-full", className)} style={{ columnWidth, columnGap: gap }}>
      {Children.toArray(children).map((child, i) => (
        <div key={i} className="break-inside-avoid" style={{ marginBottom: gap }}>
          {child}
        </div>
      ))}
    </div>
  );
}
