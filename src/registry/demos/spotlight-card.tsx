"use client";

import { Layers, Palette } from "lucide-react";
import { SpotlightCard } from "@/registry/ui/spotlight-card";

export default function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <SpotlightCard>
        <Layers className="size-5 text-primary" />
        <p className="mt-4 font-semibold">Composable</p>
        <p className="mt-1 text-sm text-muted-foreground">Small parts that fit together into whole screens.</p>
      </SpotlightCard>
      <SpotlightCard>
        <Palette className="size-5 text-primary" />
        <p className="mt-4 font-semibold">Themeable</p>
        <p className="mt-1 text-sm text-muted-foreground">One set of CSS variables controls every colour.</p>
      </SpotlightCard>
    </div>
  );
}
