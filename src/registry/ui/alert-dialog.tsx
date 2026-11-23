"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap, useIsClient, useLockScroll, usePresence } from "@/lib/hooks";
import { Button } from "@/registry/ui/button";

export interface AlertDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the dialog should open or close. */
  onOpenChange: (open: boolean) => void;
  /** Heading, also used as the accessible name. */
  title: string;
  /** Supporting text under the title. */
  description?: React.ReactNode;
  /** Text on the confirm button. */
  confirmLabel?: string;
  /** Text on the cancel button. */
  cancelLabel?: string;
  /** Red confirm button and a warning icon. */
  destructive?: boolean;
  /** Phrase the user must type before the confirm button unlocks. */
  confirmText?: string;
  /** Runs on confirm. A returned promise shows a spinner until it settles. */
  onConfirm?: () => unknown;
}

/**
 * Interrupting confirmation. Unlike Dialog it doesn't close on outside click,
 * and can require the user to type a phrase before the action unlocks.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  destructive = false,
  confirmText,
  onConfirm,
}: AlertDialogProps) {
  const { mounted, closing } = usePresence(open, 150);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useLockScroll(open);
  useFocusTrap(panel, open);
  useEffect(() => {
    if (open) setTyped("");
    const onKey = (e: KeyboardEvent) => open && e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  const isClient = useIsClient();
  if (!mounted || !isClient) return null;
  const locked = !!confirmText && typed !== confirmText;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div
        className={cn("absolute inset-0 bg-black/55 backdrop-blur-[2px]", closing ? "opacity-0 transition-opacity" : "animate-fade")}
        aria-hidden
      />
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md rounded-2xl border bg-background p-6 text-foreground shadow-2xl outline-none",
          closing ? "animate-out" : "animate-in"
        )}
      >
        <div className="flex gap-4">
          {destructive && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive">
              <TriangleAlert className="size-5" />
            </span>
          )}
          <div className="grid gap-1.5">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {confirmText && (
          <label className="mt-5 grid gap-2 text-sm">
            <span>
              Type <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">{confirmText}</span> to confirm.
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              data-autofocus
              className="h-9 rounded-md border border-input bg-background px-3 font-mono text-base outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/25 sm:text-sm"
            />
          </label>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-autofocus={!confirmText || undefined}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={locked}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm?.();
              } finally {
                setBusy(false);
              }
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
