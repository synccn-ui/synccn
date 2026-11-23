"use client";

import type * as React from "react";
import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

interface TabsContextValue {
  current: string;
  setCurrent: (value: string) => void;
  id: string;
  variant: "pill" | "underline";
}

const Ctx = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tabs parts must be used inside <Tabs>.");
  return ctx;
};

export interface TabsProps {
  /** Controlled active tab. */
  value?: string;
  /** Initial tab when uncontrolled. */
  defaultValue?: string;
  /** Called with the new tab. */
  onValueChange?: (value: string) => void;
  /** Tab list style. */
  variant?: "pill" | "underline";
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function Tabs({ value, defaultValue, onValueChange, variant = "pill", className, children }: TabsProps) {
  const [current, setCurrent] = useControllable({ value, defaultValue: defaultValue ?? "", onChange: onValueChange });
  const id = useId();
  return (
    <Ctx.Provider value={{ current, setCurrent, id, variant }}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </Ctx.Provider>
  );
}

export interface TabsListProps {
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Tab list with a sliding indicator that follows the active trigger. */
export function TabsList({ className, children }: TabsListProps) {
  const { current, variant } = useTabs();
  const ref = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const el = root?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!root || !el) return;
    const measure = () => setInd({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [current]);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = [...ref.current!.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')];
    const i = tabs.indexOf(document.activeElement as HTMLElement);
    const dir = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (e.key === "Home") return (tabs[0]?.focus(), tabs[0]?.click());
    if (e.key === "End") return (tabs.at(-1)?.focus(), tabs.at(-1)?.click());
    if (!dir || i < 0) return;
    const n = tabs[(i + dir + tabs.length) % tabs.length];
    n.focus();
    n.click();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      onKeyDown={onKey}
      className={cn(
        "relative inline-flex w-fit max-w-full items-center overflow-x-auto scrollbar-none",
        variant === "pill" && "h-9 rounded-lg bg-muted p-1 text-muted-foreground",
        variant === "underline" && "h-10 gap-4 border-b text-muted-foreground",
        className
      )}
    >
      {ind && (
        <span
          aria-hidden
          className={cn(
            "absolute transition-[left,width] duration-300 ease-[cubic-bezier(.3,1.1,.4,1)]",
            variant === "pill" && "inset-y-1 rounded-md bg-background shadow-sm dark:bg-accent",
            variant === "underline" && "-bottom-px h-0.5 rounded-full bg-primary"
          )}
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  /** Tab this trigger activates. */
  value: string;
  /** Prevents selection. */
  disabled?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function TabsTrigger({ value, className, children, disabled }: TabsTriggerProps) {
  const { current, setCurrent, id, variant } = useTabs();
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-t-${value}`}
      aria-selected={selected}
      aria-controls={`${id}-p-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setCurrent(value)}
      className={cn(
        "relative z-10 inline-flex h-full items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 [&_svg]:size-4",
        variant === "pill" && "rounded-md px-3",
        variant === "underline" && "px-0.5",
        selected ? "text-foreground" : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  /** Tab this panel belongs to. */
  value: string;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { current, id } = useTabs();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${id}-p-${value}`}
      aria-labelledby={`${id}-t-${value}`}
      className={cn("animate-fade outline-none", className)}
    >
      {children}
    </div>
  );
}
