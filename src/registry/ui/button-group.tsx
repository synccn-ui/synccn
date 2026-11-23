import type * as React from "react";
import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps {
  /** Direction the buttons are joined in. */
  orientation?: "horizontal" | "vertical";
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/**
 * Joins buttons into one control: shared borders, outer corners only.
 * Works with Button, DropdownMenu triggers and Inputs.
 */
export function ButtonGroup({ orientation = "horizontal", className, children }: ButtonGroupProps) {
  const vertical = orientation === "vertical";
  return (
    <div
      role="group"
      className={cn(
        "inline-flex w-fit isolate",
        vertical ? "flex-col [&>*:not(:first-child)]:-mt-px" : "[&>*:not(:first-child)]:-ml-px",
        vertical
          ? "[&>*]:rounded-none [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md"
          : "[&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md",
        "[&>*]:focus-visible:z-10 [&>*:hover]:z-10",
        className
      )}
    >
      {Children.map(children, (c) => (isValidElement<{ className?: string }>(c) ? cloneElement(c, { className: cn(c.props.className, "shadow-none") }) : c))}
    </div>
  );
}

export interface ButtonGroupSeparatorProps {}

/** Thin divider for groups of filled (non-outline) buttons. */
export function ButtonGroupSeparator() {
  return <span aria-hidden className="w-px self-stretch bg-primary-foreground/20" />;
}
