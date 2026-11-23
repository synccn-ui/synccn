"use client";

import { Zap } from "lucide-react";
import { Ripple } from "@/registry/ui/aurora";

export default function RippleDemo() {
  return (
    <div className="relative grid h-80 w-full max-w-xl place-items-center overflow-hidden rounded-2xl border bg-background">
      <Ripple />
      <span className="relative grid size-16 place-items-center rounded-2xl bg-foreground text-background shadow-xl">
        <Zap className="size-7" />
      </span>
    </div>
  );
}
