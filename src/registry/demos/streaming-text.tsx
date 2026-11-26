"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { StreamingText } from "@/registry/ui/streaming-text";

const ANSWER = `Short answer: **yes**, but cache the session lookup.

Middleware runs on every request, so a database call there adds latency to every page. Two options:
- Read a signed cookie with \`jose\` and only hit the database when it's missing.
- Keep the check in the route handler and leave middleware for redirects.

I'd start with the first one; it's about 20 lines.`;

export default function StreamingTextDemo() {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="grid w-full max-w-lg gap-3 rounded-xl border bg-card p-5">
      <StreamingText key={run} text={ANSWER} speed={110} onDone={() => setDone(true)} />
      <button
        type="button"
        onClick={() => (setDone(false), setRun((r) => r + 1))}
        disabled={!done}
        className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <RotateCcw className="size-3.5" /> Replay
      </button>
    </div>
  );
}
