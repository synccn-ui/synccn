"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { ChatBubble } from "@/registry/ui/chat";
import { PromptInput } from "@/registry/ui/prompt-input";
import { ShimmerText } from "@/registry/ui/shimmer-text";
import { Toggle } from "@/registry/ui/toggle";

export default function PromptInputDemo() {
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<{ from: "me" | "them"; text: string }[]>([]);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();
  return (
    <div className="grid w-full max-w-lg gap-4">
      {msgs.length > 0 && (
        <div className="grid gap-3">
          {msgs.map((m, i) => (
            <ChatBubble key={i} from={m.from} name="Assistant" showAvatar={false}>
              {m.text}
            </ChatBubble>
          ))}
          {busy && <ShimmerText className="pl-10 text-sm">Thinking…</ShimmerText>}
        </div>
      )}
      <PromptInput
        busy={busy}
        placeholder="Describe the component you need…"
        toolbar={
          <Toggle size="sm" aria-label="Search the web">
            <Globe /> Search
          </Toggle>
        }
        onSubmit={({ text, files }) => {
          setMsgs((m) => [...m, { from: "me", text: text || `${files.length} file(s)` }]);
          setBusy(true);
          setTimer(setTimeout(() => {
            setBusy(false);
            setMsgs((m) => [...m, { from: "them", text: "Here's a starting point: a Card with a header, a form and a primary action." }]);
          }, 1800));
        }}
        onStop={() => (clearTimeout(timer), setBusy(false))}
      />
      <p className="text-center text-xs text-muted-foreground">Enter to send, Shift+Enter for a new line. Drop files to attach.</p>
    </div>
  );
}
