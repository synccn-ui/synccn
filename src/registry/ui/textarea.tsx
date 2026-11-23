"use client";

import type * as React from "react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "autoGrow"> {
  /** Grow with the content. */
  autoGrow?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, maxLength, autoGrow = true, onChange, defaultValue, ...props }: TextareaProps,
  ref
) {
  const [count, setCount] = useState(String(props.value ?? defaultValue ?? "").length);
  const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    if (autoGrow) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight + 2}px`;
    }
    onChange?.(e);
  };
  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        maxLength={maxLength}
        defaultValue={defaultValue}
        onChange={handle}
        className={cn(
          "flex min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs sm:text-sm",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          maxLength && "pb-6",
          className
        )}
        {...props}
      />
      {maxLength && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-xs tabular-nums text-muted-foreground">
          {count}/{maxLength}
        </span>
      )}
    </div>
  );
});
