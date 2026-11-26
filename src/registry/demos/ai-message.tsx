"use client";

import { useState } from "react";
import { AIMessage } from "@/registry/ui/ai-message";
import { MarkdownLite } from "@/registry/ui/streaming-text";

const VERSIONS = [
  "Use `Intl.RelativeTimeFormat`. It's built in, so there's nothing to install:\n\n- `rtf.format(-3, \"day\")` gives \"3 days ago\"\n- Pass `numeric: \"auto\"` to get \"yesterday\" instead of \"1 day ago\"",
  "If you already use **date-fns**, `formatDistanceToNow(date, { addSuffix: true })` does it in one line. Otherwise `Intl.RelativeTimeFormat` works without a dependency.",
];

export default function AIMessageDemo() {
  const [v, setV] = useState(0);
  const [versions, setVersions] = useState(VERSIONS.slice(0, 1));
  return (
    <div className="grid w-full max-w-xl gap-6">
      <AIMessage from="user">How do I show "3 days ago" in JavaScript?</AIMessage>
      <AIMessage
        from="assistant"
        model="Fast"
        copyText={versions[v]}
        onRegenerate={() => {
          const next = VERSIONS[versions.length % VERSIONS.length];
          setVersions([...versions, next]);
          setV(versions.length);
        }}
        onFeedback={() => {}}
        branch={{ index: v, total: versions.length, onChange: setV }}
      >
        <MarkdownLite>{versions[v]}</MarkdownLite>
      </AIMessage>
    </div>
  );
}
