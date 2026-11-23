"use client";

import { Sparkles } from "lucide-react";
import { FlipCard } from "@/registry/ui/aurora";

export default function FlipCardDemo() {
  return (
    <FlipCard
      front={
        <span className="flex flex-col justify-between">
          <Sparkles className="size-6" />
          <span className="grid gap-1">
            <span className="text-lg font-semibold">What's a design token?</span>
            <span className="text-sm text-muted-foreground">Click to reveal the answer.</span>
          </span>
        </span>
      }
      back={
        <span className="flex flex-col justify-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Answer</span>
          <span className="text-[15px] leading-relaxed">A named value, like a colour or spacing step, that every component shares so the design stays consistent.</span>
        </span>
      }
    />
  );
}
