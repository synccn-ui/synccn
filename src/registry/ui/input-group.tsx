import type * as React from "react";
import { cn } from "@/lib/utils";

export interface InputGroupProps {
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/**
 * Field with attached addons. Put <InputAddon>, <input> (InputGroupInput)
 * and <InputGroupButton> inside in any order.
 */
export function InputGroup({ className, children }: InputGroupProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface InputGroupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <input
      className={cn("min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm", className)}
      {...props}
    />
  );
}

export interface InputAddonProps {
  /** Muted draws a filled block with a divider. */
  variant?: "plain" | "muted";
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Text or icon segment. variant "muted" draws a filled block with a divider. */
export function InputAddon({ variant = "plain", className, children }: InputAddonProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground [&_svg]:size-4",
        variant === "muted" ? "border-input bg-muted/60 px-3 first:border-r last:border-l" : "px-3 first:pr-0 last:pl-0",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function InputGroupButton({ className, ...props }: InputGroupButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "m-1 inline-flex shrink-0 items-center gap-1.5 rounded-[5px] bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  );
}
