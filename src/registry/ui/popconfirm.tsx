"use client";

import type * as React from "react";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";

export interface PopconfirmProps {
  /** The button that asks. */
  children: React.ReactElement<any>;
  /** The question, e.g. "Delete this branch?". */
  title: React.ReactNode;
  /** What happens, in a sentence. */
  description?: React.ReactNode;
  /**
   * Label on the confirm button.
   * @default "Confirm"
   */
  confirmLabel?: string;
  /**
   * Label on the cancel button.
   * @default "Cancel"
   */
  cancelLabel?: string;
  /** Styles the confirm button and icon as destructive. */
  destructive?: boolean;
  /** Runs on confirm. Return a promise to show a spinner until it settles. */
  onConfirm: () => unknown;
  /**
   * Which side of the trigger it opens on.
   * @default "top"
   */
  side?: "top" | "bottom";
  /**
   * Alignment with the trigger.
   * @default "center"
   */
  align?: "start" | "center" | "end";
}

/**
 * A small "Are you sure?" bubble next to the button, for quick, low-stakes confirmations
 * where a full dialog would be too much. Focus starts on Cancel.
 */
export function Popconfirm({ children, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive = false, onConfirm, side = "top", align = "center" }: PopconfirmProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent side={side} align={align} role="alertdialog" aria-label={typeof title === "string" ? title : "Confirm"} className="grid w-64 gap-3 p-3.5">
        <div className="flex gap-2.5">
          <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", destructive ? "text-destructive" : "text-amber-600 dark:text-warning")} aria-hidden />
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-snug">{title}</p>
            {description && <p className="text-[13px] leading-snug text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" data-autofocus autoFocus onClick={() => setOpen(false)} disabled={busy} className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-xs hover:bg-accent">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium shadow-sm disabled:opacity-70", destructive ? "bg-destructive text-white hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90")}
          >
            {busy && <Loader2 className="size-3 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
