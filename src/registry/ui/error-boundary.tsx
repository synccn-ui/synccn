"use client";

import type * as React from "react";
import { Component, useState } from "react";
import { AlertOctagon, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorFallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
  /** Heading. */
  title?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** The default "Something went wrong" panel: message, retry and the stack trace behind a toggle. */
export function ErrorFallback({ error, reset, title = "Something went wrong", className }: ErrorFallbackProps) {
  const [open, setOpen] = useState(false);
  return (
    <div role="alert" className={cn("grid w-full gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4 text-left", className)}>
      <div className="flex gap-3">
        <AlertOctagon className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="grid min-w-0 gap-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="break-words text-[13px] text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-8">
        <button type="button" onClick={reset} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-[13px] font-medium shadow-xs hover:bg-accent">
          <RotateCcw className="size-3.5" /> Try again
        </button>
        {error.stack && (
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] text-muted-foreground hover:text-foreground">
            Details <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>
      {open && error.stack && <pre className="ml-8 max-h-48 overflow-auto rounded-md bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{error.stack}</pre>}
    </div>
  );
}

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
  /** Replaces the default panel. */
  fallback?: (props: { error: Error; reset: () => void }) => React.ReactNode;
  /** Called with the error and React's component stack, for logging. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
  /** When any of these change while showing an error, it resets by itself (a new route, a new id). */
  resetKeys?: unknown[];
  /** Called after a reset. */
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches errors thrown while rendering its children and shows a retry panel instead of a
 * blank page. Resets on "Try again" or when `resetKeys` change. Works in Next.js client components.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    const a = prev.resetKeys ?? [];
    const b = this.props.resetKeys ?? [];
    if (this.state.error && (a.length !== b.length || a.some((v, i) => !Object.is(v, b[i])))) this.reset();
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return this.props.fallback ? this.props.fallback({ error, reset: this.reset }) : <ErrorFallback error={error} reset={this.reset} />;
  }
}
