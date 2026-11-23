"use client";

import { Sparkles } from "lucide-react";
import { ShimmerText } from "@/registry/ui/shimmer-text";

export default function ShimmerTextDemo() {
  return (
    <div className="grid justify-items-center gap-5">
      <p className="text-3xl font-semibold tracking-tight">
        <ShimmerText>Generating your theme</ShimmerText>
      </p>
      <div className="flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm">
        <Sparkles className="size-4 text-primary" />
        <ShimmerText duration={1.8}>Thinking…</ShimmerText>
      </div>
    </div>
  );
}
