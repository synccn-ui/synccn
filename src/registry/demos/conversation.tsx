"use client";

import { useEffect, useState } from "react";
import { AIMessage } from "@/registry/ui/ai-message";
import { Conversation } from "@/registry/ui/conversation";
import { MarkdownLite } from "@/registry/ui/streaming-text";

const SCRIPT: { from: "user" | "assistant"; text: string }[] = [
  { from: "user", text: "What's the difference between useMemo and useCallback?" },
  { from: "assistant", text: "`useMemo` caches a **value**; `useCallback` caches a **function**. `useCallback(fn, deps)` is the same as `useMemo(() => fn, deps)`." },
  { from: "user", text: "When should I actually use them?" },
  { from: "assistant", text: "Mostly when something downstream compares by reference:\n\n- A child wrapped in `memo` that receives the value or function\n- A dependency of another hook's array\n- A genuinely expensive calculation\n\nEverywhere else they add code without making anything faster." },
  { from: "user", text: "And with the React Compiler?" },
  { from: "assistant", text: "The compiler memoizes for you, so you can usually delete both. Keep them only where you need a guaranteed stable reference, such as an effect dependency." },
];

export default function ConversationDemo() {
  const [n, setN] = useState(2);
  useEffect(() => {
    if (n >= SCRIPT.length) return;
    const t = setTimeout(() => setN(n + 1), 1800);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-card">
      <Conversation className="h-80">
        {SCRIPT.slice(0, n).map((m, i) => (
          <AIMessage key={i} from={m.from}>
            {m.from === "assistant" ? <MarkdownLite>{m.text}</MarkdownLite> : m.text}
          </AIMessage>
        ))}
      </Conversation>
    </div>
  );
}
