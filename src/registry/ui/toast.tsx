"use client";

import type * as React from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, Loader2, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/hooks";

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export interface ToastOptions {
  /** Reuse an id to update an existing toast in place. */
  id?: number | string;
  /** Second line under the title. */
  description?: React.ReactNode;
  /** Milliseconds before it closes. Infinity keeps it open. */
  duration?: number;
  /** Button on the right of the toast. */
  action?: { label: string; onClick?: () => void };
}

interface ToastData extends ToastOptions {
  id: number | string;
  title: React.ReactNode;
  type: ToastType;
  duration: number;
  leaving?: boolean;
}

/* A tiny global store so `toast()` can be called from anywhere. */
let toasts: ToastData[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let seq = 0;

function add(t: Omit<ToastData, "id" | "duration"> & { id?: number | string; duration?: number }) {
  const id = t.id ?? ++seq;
  const exists = toasts.some((x) => x.id === id);
  toasts = exists
    ? toasts.map((x) => (x.id === id ? { ...x, ...t, id, duration: t.duration ?? x.duration } : x))
    : [{ duration: 4000, ...t, id }, ...toasts].slice(0, 5);
  emit();
  return id;
}

/** Closes a toast by id. */
export function dismiss(id: number | string) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 200);
}

type Message<T> = React.ReactNode | ((value: T) => React.ReactNode);

/**
 * Shows a toast. Call it anywhere once <Toaster /> is mounted.
 * toast("Saved"), toast.success(...), toast.error(...), toast.promise(...)
 */
export const toast = Object.assign((title: React.ReactNode, opts: ToastOptions = {}) => add({ title, type: "default", ...opts }), {
  success: (title: React.ReactNode, opts?: ToastOptions) => add({ title, type: "success", ...opts }),
  error: (title: React.ReactNode, opts?: ToastOptions) => add({ title, type: "error", ...opts }),
  warning: (title: React.ReactNode, opts?: ToastOptions) => add({ title, type: "warning", ...opts }),
  info: (title: React.ReactNode, opts?: ToastOptions) => add({ title, type: "info", ...opts }),
  loading: (title: React.ReactNode, opts?: ToastOptions) => add({ title, type: "loading", duration: Infinity, ...opts }),
  /** Shows a loading toast that resolves into success or error. */
  promise: <T,>(
    promise: Promise<T>,
    { loading, success, error }: { loading: React.ReactNode; success: Message<T>; error: Message<unknown> }
  ) => {
    const id = add({ title: loading, type: "loading", duration: Infinity });
    promise.then(
      (r) => add({ id, title: typeof success === "function" ? success(r) : success, type: "success", duration: 4000 }),
      (e: unknown) => add({ id, title: typeof error === "function" ? error(e) : error, type: "error", duration: 4000 })
    );
    return promise;
  },
  dismiss,
});

const icons: Partial<Record<ToastType, React.ReactNode>> = {
  success: <CheckCircle2 className="size-[18px] text-success" />,
  error: <XCircle className="size-[18px] text-destructive" />,
  warning: <TriangleAlert className="size-[18px] text-warning" />,
  info: <Info className="size-[18px] text-primary" />,
  loading: <Loader2 className="size-[18px] animate-spin text-muted-foreground" />,
};

function ToastItem({ t, index, expanded }: { t: ToastData; index: number; expanded: boolean }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (t.duration === Infinity || paused || t.leaving) return;
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.duration, t.id, paused, t.leaving, t.type]);

  const offset = expanded ? index * 72 : index * 10;
  const scale = expanded ? 1 : 1 - index * 0.05;

  return (
    <li
      role="status"
      aria-live="polite"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn(
        "pointer-events-auto absolute bottom-0 right-0 flex w-full items-start gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl shadow-black/8 transition-all duration-300 ease-[cubic-bezier(.2,.9,.3,1)]",
        t.leaving ? "translate-x-[110%] opacity-0" : "animate-[enter_.3s_ease-out]",
        !expanded && index > 2 && "opacity-0"
      )}
      style={{ transform: t.leaving ? undefined : `translateY(-${offset}px) scale(${scale})`, zIndex: 50 - index }}
    >
      {icons[t.type]}
      <div className="grid flex-1 gap-0.5">
        <p className="text-sm font-medium leading-snug">{t.title}</p>
        {t.description && <p className="text-[13px] leading-snug text-muted-foreground">{t.description}</p>}
      </div>
      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action?.onClick?.();
            dismiss(t.id);
          }}
          className="shrink-0 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background hover:opacity-90"
        >
          {t.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Dismiss"
        className="-m-1 shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

export interface ToasterProps {}

/** Mount once near the root of your app. Hover the stack to expand it. */
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const EMPTY: ToastData[] = [];

/** Renders the toast stack. Mount once near the root of your app. */
export function Toaster() {
  const isClient = useIsClient();
  const list = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY
  );
  const [expanded, setExpanded] = useState(false);
  if (!isClient) return null;
  return createPortal(
    <ol
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      className="pointer-events-none fixed bottom-4 right-4 z-[200] w-[calc(100%-2rem)] max-w-[22rem]"
      style={{ height: list.length ? (expanded ? list.length * 72 : 80) : 0 }}
    >
      {list.map((t, i) => (
        <ToastItem key={t.id} t={t} index={i} expanded={expanded} />
      ))}
    </ol>,
    document.body
  );
}
