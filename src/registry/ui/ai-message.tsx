"use client";

import type * as React from "react";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export interface AIMessageBranch {
  /** Which version is shown, from 0. */
  index: number;
  /** How many versions there are. */
  total: number;
  /** Called with the version to show. */
  onChange: (index: number) => void;
}

export interface AIMessageProps {
  /** Who wrote it. The person's messages are bubbles on the right; the assistant's are full width. */
  from: "user" | "assistant";
  /**
   * Name shown above assistant messages.
   * @default "Assistant"
   */
  name?: string;
  /** Model name shown after the assistant's name. */
  model?: string;
  /** Replaces the assistant's sparkle mark. */
  avatar?: React.ReactNode;
  /** Plain text for the copy button. Without it, there's no copy button. */
  copyText?: string;
  /** Shows a regenerate button. */
  onRegenerate?: () => void;
  /** Current rating, when controlled. */
  feedback?: "up" | "down" | null;
  /** Shows thumbs up and down. Called with the new rating, or null when it's taken back. */
  onFeedback?: (value: "up" | "down" | null) => void;
  /** Arrows to flip between regenerated versions. */
  branch?: AIMessageBranch;
  /** Hides the actions while the answer is still being written. */
  streaming?: boolean;
  /** Content to render: text, StreamingText, Reasoning, ToolCall… */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

const iconBtn = "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-3.5";

/**
 * One turn in an AI conversation: the person's message as a bubble, or the assistant's
 * answer with copy, regenerate, thumbs up/down and version arrows underneath.
 */
export function AIMessage({ from, name = "Assistant", model, avatar, copyText: text, onRegenerate, feedback: controlled, onFeedback, branch, streaming = false, children, className }: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const [own, setOwn] = useState<"up" | "down" | null>(null);
  const feedback = controlled !== undefined ? controlled : own;

  if (from === "user") {
    return (
      <div className={cn("flex justify-end", className)}>
        <div className="max-w-[85%] animate-in whitespace-pre-wrap rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm leading-relaxed">{children}</div>
      </div>
    );
  }

  const rate = (v: "up" | "down") => {
    const next = feedback === v ? null : v;
    setOwn(next);
    onFeedback?.(next);
  };
  const hasActions = !!(text || onRegenerate || onFeedback || branch);

  return (
    <div className={cn("group/msg flex gap-3", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-lg border bg-card text-primary shadow-xs" aria-hidden>
        {avatar ?? <Sparkles className="size-3.5" />}
      </span>
      <div className="grid min-w-0 flex-1 gap-2">
        <p className="flex min-h-7 items-center gap-2 text-[13px]">
          <span className="font-medium">{name}</span>
          {model && <span className="truncate text-muted-foreground">{model}</span>}
        </p>
        <div className="grid min-w-0 gap-3">{children}</div>
        {hasActions && !streaming && (
          <div className="-ml-1.5 flex animate-fade flex-wrap items-center gap-0.5">
            {branch && branch.total > 1 && (
              <span className="mr-1 inline-flex items-center text-xs tabular-nums text-muted-foreground">
                <button type="button" className={iconBtn} aria-label="Previous version" disabled={branch.index === 0} onClick={() => branch.onChange(branch.index - 1)}>
                  <ChevronLeft />
                </button>
                <span aria-live="polite">
                  {branch.index + 1} / {branch.total}
                </span>
                <button type="button" className={iconBtn} aria-label="Next version" disabled={branch.index >= branch.total - 1} onClick={() => branch.onChange(branch.index + 1)}>
                  <ChevronRight />
                </button>
              </span>
            )}
            {text && (
              <button
                type="button"
                className={iconBtn}
                aria-label={copied ? "Copied" : "Copy answer"}
                onClick={async () => {
                  if (await copyText(text)) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }
                }}
              >
                {copied ? <Check className="text-success" /> : <Copy />}
              </button>
            )}
            {onRegenerate && (
              <button type="button" className={iconBtn} aria-label="Regenerate" onClick={onRegenerate}>
                <RefreshCw />
              </button>
            )}
            {onFeedback && (
              <>
                <button type="button" className={cn(iconBtn, feedback === "up" && "text-foreground")} aria-label="Good answer" aria-pressed={feedback === "up"} onClick={() => rate("up")}>
                  <ThumbsUp className={cn(feedback === "up" && "fill-current")} />
                </button>
                <button type="button" className={cn(iconBtn, feedback === "down" && "text-foreground")} aria-label="Bad answer" aria-pressed={feedback === "down"} onClick={() => rate("down")}>
                  <ThumbsDown className={cn(feedback === "down" && "fill-current")} />
                </button>
              </>
            )}
            {feedback && <span className="ml-1 animate-fade text-xs text-muted-foreground">Thanks for the feedback</span>}
          </div>
        )}
      </div>
    </div>
  );
}
