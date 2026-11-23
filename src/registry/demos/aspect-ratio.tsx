"use client";

import { Play } from "lucide-react";
import { AspectRatio } from "@/registry/ui/collapsible";

export default function AspectRatioDemo() {
  return (
    <div className="grid w-full max-w-md gap-3 sm:grid-cols-[2fr_1fr]">
      <AspectRatio ratio={16 / 9} className="grid place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_20%,oklch(0.6_0.14_250),oklch(0.25_0.06_270))]">
        <span className="grid size-12 place-items-center rounded-full bg-white/90 text-black shadow-lg">
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
        <span className="absolute bottom-2 left-3 text-xs font-medium text-white/80">16 / 9</span>
      </AspectRatio>
      <AspectRatio ratio={1} className="rounded-xl bg-[radial-gradient(circle_at_70%_30%,oklch(0.75_0.14_60),oklch(0.4_0.12_20))]">
        <span className="absolute bottom-2 left-3 text-xs font-medium text-white/80">1 / 1</span>
      </AspectRatio>
    </div>
  );
}
