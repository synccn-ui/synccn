import type * as React from "react";
import { Lock, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrowserMockupProps {
  /** Text in the address bar. */
  url?: string;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Browser window frame for screenshots and live UI. */
export function BrowserMockup({ url = "example.com", children, className }: BrowserMockupProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/20", className)}>
      <div className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-sm items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground">
          <Lock className="size-3" />
          <span className="flex-1 truncate text-center">{url}</span>
          <RotateCw className="size-3" />
        </div>
        <span className="hidden w-[52px] sm:block" />
      </div>
      <div className="relative bg-background">{children}</div>
    </div>
  );
}

export interface PhoneMockupProps {
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Phone frame with a dynamic-island notch. */
export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-64 rounded-[44px] border-[10px] border-[oklch(0.22_0_0)] bg-[oklch(0.22_0_0)] shadow-2xl shadow-black/30 ring-1 ring-white/10",
        className
      )}
    >
      <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative size-full overflow-hidden rounded-[34px] bg-background">{children}</div>
      <span className="absolute -left-[13px] top-24 h-10 w-[3px] rounded-l bg-[oklch(0.3_0_0)]" />
      <span className="absolute -left-[13px] top-36 h-14 w-[3px] rounded-l bg-[oklch(0.3_0_0)]" />
      <span className="absolute -right-[13px] top-28 h-16 w-[3px] rounded-r bg-[oklch(0.3_0_0)]" />
    </div>
  );
}
