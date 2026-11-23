"use client";

import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, Inbox, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";

export type AsyncStatus = "idle" | "loading" | "success" | "empty" | "error" | "timeout";

export interface UseAsyncOptions<T> {
  /** Give up after this many ms and report "timeout". 0 turns it off. Default 10000. */
  timeout?: number;
  /** Retry this many times on failure before reporting "error". Default 0. */
  retries?: number;
  /** Decides when a result counts as empty. Default: null, undefined or an empty array. */
  isEmpty?: (data: T) => boolean;
  /** Run on mount. Default true. */
  immediate?: boolean;
}

export interface AsyncResult<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: unknown;
  /** Runs the loader again. */
  retry: () => void;
}

const defaultEmpty = (d: unknown) => d == null || (Array.isArray(d) && d.length === 0);

/**
 * Runs an async loader and tracks it as one status: loading, success, empty, error or
 * timeout, with optional automatic retries. Late answers from earlier runs are ignored.
 */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: React.DependencyList, { timeout = 10000, retries = 0, isEmpty = defaultEmpty, immediate = true }: UseAsyncOptions<T> = {}): AsyncResult<T> {
  const [state, setState] = useState<{ status: AsyncStatus; data: T | undefined; error: unknown }>({ status: immediate ? "loading" : "idle", data: undefined, error: undefined });
  const run = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  const emptyRef = useRef(isEmpty);
  emptyRef.current = isEmpty;

  const start = useCallback(() => {
    const id = ++run.current;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: undefined }));
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (timeout) {
      timer = setTimeout(() => {
        if (run.current !== id) return;
        ctrl.abort();
        setState((s) => ({ ...s, status: "timeout" }));
      }, timeout);
    }
    const attempt = (left: number): Promise<T> => loadRef.current(ctrl.signal).catch((e) => (left > 0 && !ctrl.signal.aborted ? attempt(left - 1) : Promise.reject(e)));
    attempt(retries).then(
      (data) => {
        if (run.current !== id || ctrl.signal.aborted) return;
        clearTimeout(timer);
        setState({ status: emptyRef.current(data) ? "empty" : "success", data, error: undefined });
      },
      (error) => {
        if (run.current !== id || ctrl.signal.aborted) return;
        clearTimeout(timer);
        setState((s) => ({ ...s, status: "error", error }));
      }
    );
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [timeout, retries]);

  useEffect(() => {
    if (!immediate) return;
    return start();
    // `deps` decides when to reload, like useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, start, immediate]);

  return { ...state, retry: start };
}

export interface AsyncStateProps<T> {
  /** Current status, usually from useAsync. */
  status: AsyncStatus;
  /** The loaded data, passed to `children`. */
  data?: T;
  /** Error message (or the thrown value) for the error state. */
  error?: unknown;
  /** Called by the "Try again" button in the error and timeout states. */
  onRetry?: () => void;
  /** Shown while loading. Defaults to three shimmering lines. */
  loading?: React.ReactNode;
  /** Shown when the result is empty. */
  empty?: React.ReactNode;
  /** Shown when loading fails. Defaults to the error message with a retry button. */
  errorFallback?: (error: unknown, retry?: () => void) => React.ReactNode;
  /** What loading is about, for screen readers, e.g. "invoices". */
  label?: string;
  /** Renders the data. */
  children: (data: T) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

const message = (e: unknown) => (e instanceof Error ? e.message : typeof e === "string" ? e : "Something went wrong.");

/**
 * One consistent way to show loading, empty, error, timeout and loaded states, with
 * skeleton-to-content fades, retry buttons and polite screen reader announcements.
 */
export function AsyncState<T>({ status, data, error, onRetry, loading, empty, errorFallback, label = "content", children, className }: AsyncStateProps<T>) {
  const announce =
    status === "loading" ? `Loading ${label}` : status === "error" ? `Couldn't load ${label}` : status === "timeout" ? `Loading ${label} is taking too long` : status === "empty" ? `No ${label}` : status === "success" ? `Loaded ${label}` : "";
  return (
    <div className={cn("relative", className)} aria-busy={status === "loading" || undefined}>
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
      {status === "loading" || status === "idle" ? (
        (loading ?? (
          <div className="grid gap-2.5" aria-hidden>
            {[92, 76, 84].map((w) => (
              <span key={w} className="block h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
        ))
      ) : status === "error" || status === "timeout" ? (
        errorFallback && status === "error" ? (
          errorFallback(error, onRetry)
        ) : (
          <div className="grid animate-fade justify-items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
            {status === "timeout" ? <Clock className="size-6 text-warning" /> : <AlertCircle className="size-6 text-destructive" />}
            <div className="grid gap-1">
              <p className="text-sm font-medium">{status === "timeout" ? "This is taking longer than it should" : `Couldn't load ${label}`}</p>
              <p className="text-sm text-muted-foreground">{status === "timeout" ? "The server didn't answer in time. Check your connection and try again." : message(error)}</p>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw /> Try again
              </Button>
            )}
          </div>
        )
      ) : status === "empty" ? (
        (empty ?? (
          <div className="grid animate-fade justify-items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
            <Inbox className="size-6" />
            No {label} yet.
          </div>
        ))
      ) : (
        <div className="animate-fade">{children(data as T)}</div>
      )}
    </div>
  );
}
