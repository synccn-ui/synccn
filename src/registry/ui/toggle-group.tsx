"use client";

import type * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface ToggleGroupOption {
  value: string;
  label?: React.ReactNode;
  icon?: React.ElementType;
  "aria-label"?: string;
}

interface ToggleGroupBaseProps {
  /** Segments. */
  options: ToggleGroupOption[];
  /** Segment height. */
  size?: "sm" | "default";
  /** Extra classes for the root element. */
  className?: string;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** One choice (string value) or several (array value). */
  type?: "single";
  /** Controlled value: a string, or string[] when type is multiple. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value. */
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

/**
 * Segmented control. type "single" -> value is a string,
 * type "multiple" -> value is an array.
 * options: [{ value, label?, icon?, "aria-label"? }]
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const { options, type = "single", size = "default", className } = props;
  const [current, setCurrent] = useControllable<string | string[]>({
    value: props.value,
    defaultValue: props.defaultValue ?? (type === "single" ? (options[0]?.value ?? "") : []),
    onChange: props.onValueChange as ((v: string | string[]) => void) | undefined,
  });
  const ref = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);
  const isOn = (v: string) => (Array.isArray(current) ? current.includes(v) : current === v);

  useLayoutEffect(() => {
    if (type !== "single") return;
    const el = ref.current?.querySelector<HTMLElement>('[data-on="true"]');
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [current, type]);

  const toggle = (v: string) => {
    if (type === "single" || !Array.isArray(current)) setCurrent(v);
    else setCurrent(isOn(v) ? current.filter((x) => x !== v) : [...current, v]);
  };

  return (
    <div
      ref={ref}
      role={type === "single" ? "radiogroup" : "group"}
      className={cn("relative inline-flex items-center rounded-lg border bg-muted/60 p-0.5", className)}
    >
      {ind && (
        <span
          aria-hidden
          className="absolute inset-y-0.5 rounded-md border bg-background shadow-xs transition-[left,width] duration-300 ease-[cubic-bezier(.3,1.1,.4,1)]"
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {options.map((o) => {
        const Icon = o.icon;
        const on = isOn(o.value);
        return (
          <button
            key={o.value}
            type="button"
            data-on={on}
            role={type === "single" ? "radio" : undefined}
            aria-checked={type === "single" ? on : undefined}
            aria-pressed={type === "multiple" ? on : undefined}
            aria-label={o["aria-label"]}
            onClick={() => toggle(o.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
              on && "text-foreground",
              type === "multiple" && on && "bg-background shadow-xs"
            )}
          >
            {Icon && <Icon />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
