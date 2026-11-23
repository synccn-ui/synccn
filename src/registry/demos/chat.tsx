"use client";

import { useEffect, useState } from "react";
import { ChatBubble, TypingIndicator } from "@/registry/ui/chat";

export default function ChatDemo() {
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setTyping((x) => !x), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid w-full max-w-md gap-2 rounded-2xl border bg-card p-4">
      <ChatBubble name="Riley" showAvatar={false}>
        Did the new pricing block ship?
      </ChatBubble>
      <ChatBubble name="Riley" time="10:41">
        The yearly toggle looked great in review.
      </ChatBubble>
      <ChatBubble from="me" time="10:42" status="Read">
        Shipped this morning 🎉 It's live on the blocks page.
      </ChatBubble>
      {typing ? (
        <TypingIndicator name="Riley" />
      ) : (
        <ChatBubble name="Riley" time="10:43">
          Perfect, sharing it with Jayden now.
        </ChatBubble>
      )}
    </div>
  );
}
