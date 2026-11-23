"use client";

import { BarChart3, BookOpen, Boxes, LayoutTemplate, Palette, Rocket, Shield, Zap } from "lucide-react";
import { NavigationMenu } from "@/registry/ui/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <div className="flex h-80 w-full max-w-xl justify-center pt-2">
      <NavigationMenu
        items={[
          {
            label: "Product",
            featured: { title: "What's new", description: "Range calendars, a prompt input and 40 more components." },
            links: [
              { title: "Components", description: "Over 100 accessible building blocks.", icon: Boxes },
              { title: "Blocks", description: "Full sections ready to paste in.", icon: LayoutTemplate },
              { title: "Themes", description: "Build a palette and export it as CSS.", icon: Palette },
            ],
          },
          {
            label: "Resources",
            links: [
              { title: "Docs", description: "Install, theme and customise.", icon: BookOpen },
              { title: "Guides", description: "Step-by-step walkthroughs.", icon: Rocket },
              { title: "Performance", description: "Keep bundles small.", icon: Zap },
              { title: "Analytics", description: "See which parts get used.", icon: BarChart3 },
              { title: "Security", description: "How we review changes.", icon: Shield },
            ],
          },
          { label: "Pricing" },
          { label: "Changelog" },
        ]}
      />
    </div>
  );
}
