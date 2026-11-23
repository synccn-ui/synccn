"use client";

import { Bold, Italic, Link2, Strikethrough } from "lucide-react";
import { Kbd } from "@/registry/ui/kbd";
import { Tooltip } from "@/registry/ui/tooltip";

const tools = [
  { icon: Bold, label: "Bold", key: "⌘B", side: "top" as const },
  { icon: Italic, label: "Italic", key: "⌘I", side: "bottom" as const },
  { icon: Strikethrough, label: "Strikethrough", key: "⌘⇧X", side: "top" as const },
  { icon: Link2, label: "Add link", key: "⌘K", side: "bottom" as const },
];

export default function TooltipDemo() {
  return (
    <div className="flex gap-1 rounded-lg border bg-card p-1 shadow-xs">
      {tools.map((t) => (
        <Tooltip
          key={t.label}
          side={t.side}
          content={
            <span className="flex items-center gap-2">
              {t.label} <Kbd className="h-4 border-background/20 bg-background/15 text-background">{t.key}</Kbd>
            </span>
          }
        >
          <button type="button" aria-label={t.label} className="grid size-8 place-items-center rounded-md hover:bg-accent">
            <t.icon className="size-4" />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
