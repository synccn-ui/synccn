"use client";

import { useState } from "react";
import { FeedbackWidget } from "@/registry/ui/feedback-widget";

export default function FeedbackWidgetDemo() {
  const [last, setLast] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  return (
    <div className="grid w-full max-w-md gap-3">
      <FeedbackWidget key={key} onSubmit={(f) => new Promise<void>((r) => setTimeout(() => (setLast(`rating ${f.rating}${f.comment ? `, “${f.comment}”` : ""}`), r()), 700))} />
      <FeedbackWidget variant="thumbs" question="Did this answer your question?" onSubmit={() => {}} />
      <p className="text-center text-[13px] text-muted-foreground">
        {last ? (
          <>
            Sent {last}.{" "}
            <button type="button" className="underline underline-offset-4" onClick={() => (setKey((k) => k + 1), setLast(null))}>
              Reset
            </button>
          </>
        ) : (
          "Nothing is sent anywhere in this example."
        )}
      </p>
    </div>
  );
}
