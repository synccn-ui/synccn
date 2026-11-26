"use client";

import { useState } from "react";
import { Brain, Eye, Zap } from "lucide-react";
import { ModelSelector, type AIModel } from "@/registry/ui/model-selector";

const models: AIModel[] = [
  { id: "fast", name: "Fast", description: "Quick answers and everyday tasks", badges: ["Fast"], context: 200_000, icon: Zap },
  { id: "smart", name: "Smart", description: "Writing, analysis and code", badges: ["Vision"], context: 200_000, icon: Eye },
  { id: "deep", name: "Deep Think", description: "Hard problems, takes longer", badges: ["Reasoning"], context: 1_000_000, icon: Brain },
  { id: "max", name: "Max", description: "Available on the Team plan", context: 1_000_000, disabled: true },
];

export default function ModelSelectorDemo() {
  const [model, setModel] = useState("smart");
  return (
    <div className="grid w-full max-w-md justify-items-center gap-3 pb-56">
      <div className="flex w-full items-center justify-between rounded-xl border bg-card px-2 py-1.5">
        <ModelSelector models={models} value={model} onValueChange={setModel} />
        <span className="pr-2 text-xs text-muted-foreground">Ask anything…</span>
      </div>
      <p className="text-[13px] text-muted-foreground">
        Using <span className="font-medium text-foreground">{models.find((m) => m.id === model)?.name}</span>
      </p>
    </div>
  );
}
