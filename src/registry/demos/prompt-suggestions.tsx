"use client";

import { useState } from "react";
import { BarChart3, Bug, FileText, Lightbulb } from "lucide-react";
import { PromptSuggestions } from "@/registry/ui/prompt-suggestions";

export default function PromptSuggestionsDemo() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-xl gap-6">
      <PromptSuggestions
        variant="cards"
        onSelect={setSent}
        suggestions={[
          { label: "Summarize a document", description: "Key points from a PDF or link", icon: FileText },
          { label: "Explain an error", description: "Paste a stack trace", icon: Bug },
          { label: "Analyze data", description: "Charts from a CSV", icon: BarChart3 },
          { label: "Brainstorm names", description: "For a product or feature", icon: Lightbulb },
        ]}
      />
      <PromptSuggestions onSelect={setSent} suggestions={[{ label: "Make it shorter" }, { label: "Add code examples" }, { label: "What are the trade-offs?" }]} />
      <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
        {sent ? <>Would send: “{sent}”</> : "Pick a suggestion"}
      </p>
    </div>
  );
}
