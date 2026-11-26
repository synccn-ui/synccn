"use client";

import { useState } from "react";
import { EmojiPicker } from "@/registry/ui/emoji-picker";

export default function EmojiPickerDemo() {
  const [reactions, setReactions] = useState<string[]>(["🚀", "👀"]);
  return (
    <div className="grid justify-items-center gap-3">
      <EmojiPicker recent={["🚀", "👍", "🎉", "🔥"]} onSelect={(e) => setReactions((r) => (r.includes(e) ? r : [...r, e].slice(-8)))} />
      <p className="text-[13px] text-muted-foreground">
        Reactions: <span className="text-base">{reactions.join(" ")}</span>
      </p>
    </div>
  );
}
