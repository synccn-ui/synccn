"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Reasoning } from "@/registry/ui/reasoning";
import { StreamingText } from "@/registry/ui/streaming-text";

const THOUGHT = "The person wants the cheapest region that's still under 50 ms for EU users. Frankfurt and Amsterdam both fit. Frankfurt has the larger instance pool, but Amsterdam is about 8% cheaper for this size. Egress is the same. So Amsterdam, with Frankfurt as the failover.";

export default function ReasoningDemo() {
  const [run, setRun] = useState(0);
  const [thinking, setThinking] = useState(true);
  useEffect(() => {
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 3200);
    return () => clearTimeout(t);
  }, [run]);
  return (
    <div className="grid w-full max-w-lg gap-3 rounded-xl border bg-card p-5">
      <Reasoning streaming={thinking} key={run}>
        <StreamingText text={THOUGHT} speed={95} />
      </Reasoning>
      {!thinking && <StreamingText text="Go with **Amsterdam** (eu-west-4), and set Frankfurt as the failover region." speed={80} />}
      <button type="button" onClick={() => setRun((r) => r + 1)} className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
        <RotateCcw className="size-3.5" /> Ask again
      </button>
    </div>
  );
}
