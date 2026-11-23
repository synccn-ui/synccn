import type * as React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "icon" | "invalid"> {
  /** Icon shown inside the field on the left. */
  icon?: React.ElementType;
  /** Marks the field invalid for styling and assistive tech. */
  invalid?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon: Icon, invalid, ...props }: InputProps,
  ref
) {
  const field = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-[border-color,box-shadow] sm:text-sm",
        "placeholder:text-muted-foreground file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        Icon && "pl-9",
        className
      )}
      {...props}
    />
  );
  if (!Icon) return field;
  return (
    <div className="relative w-full">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {field}
    </div>
  );
});

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn("text-sm font-medium leading-none select-none", className)} {...props} />;
}
