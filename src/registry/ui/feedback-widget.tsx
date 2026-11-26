"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedbackWidgetProps {
  /**
   * The question.
   * @default "Was this page helpful?"
   */
  question?: string;
  /** Called when the person sends feedback. Return a promise to show "Sending…". */
  onSubmit: (feedback: { rating: number; comment: string }) => unknown;
  /**
   * "emoji" shows four faces; "thumbs" shows yes and no.
   * @default "emoji"
   */
  variant?: "emoji" | "thumbs";
  /** Extra classes for the root element. */
  className?: string;
}

const FACES = [
  { value: 1, emoji: "😞", label: "Not helpful" },
  { value: 2, emoji: "😐", label: "Somewhat helpful" },
  { value: 3, emoji: "🙂", label: "Helpful" },
  { value: 4, emoji: "🤩", label: "Very helpful" },
];
const THUMBS = [
  { value: 1, emoji: "👎", label: "No" },
  { value: 4, emoji: "👍", label: "Yes" },
];

/**
 * "Was this helpful?" for docs and help pages: pick a face, optionally say why, and get a
 * thank-you. The comment box only opens after a rating, so it stays out of the way.
 */
export function FeedbackWidget({ question = "Was this page helpful?", onSubmit, variant = "emoji", className }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const uid = useId();
  const options = variant === "emoji" ? FACES : THUMBS;

  const send = async () => {
    if (rating === null) return;
    setState("sending");
    try {
      await onSubmit({ rating, comment: comment.trim() });
      setState("sent");
    } catch {
      setState("idle");
    }
  };

  if (state === "sent")
    return (
      <div role="status" className={cn("flex w-full animate-fade items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm", className)}>
        <span className="grid size-5 place-items-center rounded-full bg-success text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
        Thanks, that helps us improve.
      </div>
    );

  return (
    <div className={cn("grid w-full gap-3 rounded-xl border bg-card p-3 text-left", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${uid}-q`} className="pl-1 text-sm font-medium">
          {question}
        </p>
        <div role="radiogroup" aria-labelledby={`${uid}-q`} className="flex gap-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={rating === o.value}
              aria-label={o.label}
              title={o.label}
              onClick={() => setRating(o.value)}
              className={cn(
                "grid size-9 place-items-center rounded-full text-lg transition-[transform,background-color,filter] duration-200 hover:scale-110 hover:bg-accent",
                rating === null ? "" : rating === o.value ? "scale-110 bg-brand-soft" : "opacity-50 grayscale"
              )}
            >
              {o.emoji}
            </button>
          ))}
        </div>
      </div>
      {rating !== null && (
        <div className="grid animate-fade gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={rating <= 2 ? "What was missing or wrong?" : "Anything we could do better? (optional)"}
            aria-label="Comment"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => (setRating(null), setComment(""))} className="inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
              Cancel
            </button>
            <button type="button" onClick={send} disabled={state === "sending"} className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
              {state === "sending" ? "Sending…" : "Send feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
