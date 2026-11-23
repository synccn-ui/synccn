"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/registry/ui/badge";
import { BorderBeam } from "@/registry/ui/border-beam";
import { Button } from "@/registry/ui/button";
import { ToggleGroup } from "@/registry/ui/toggle-group";
import { toast } from "@/registry/ui/toast";

const plans = [
  { name: "Hobby", price: 0, blurb: "For side projects and trying things out.", features: ["3 projects", "All core components", "Community support"], cta: "Start for free" },
  { name: "Pro", price: 12, blurb: "For people shipping real products.", features: ["Unlimited projects", "Every block and theme", "Figma kit", "Priority email support"], cta: "Upgrade to Pro", featured: true },
  { name: "Team", price: 39, blurb: "For teams that share one design system.", features: ["Everything in Pro", "Shared themes", "Up to 20 seats", "Private registry"], cta: "Choose Team" },
];

export default function PricingBlock() {
  const [cycle, setCycle] = useState("yearly");
  const price = (p: number) => (cycle === "yearly" ? Math.round(p * 0.8) : p);
  return (
    <div className="grid w-full max-w-5xl gap-10">
      <div className="grid justify-items-center gap-4 text-center">
        <h2 className="display-md text-4xl">Simple plans that scale with you</h2>
        <p className="max-w-md text-muted-foreground">Start free. Upgrade when you need blocks, themes and support.</p>
        <div className="flex items-center gap-3">
          <ToggleGroup value={cycle} onValueChange={setCycle} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
          <Badge variant="success">Save 20% yearly</Badge>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={cn("relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6", p.featured && "border-primary/40 shadow-xl shadow-primary/10")}>
            {p.featured && <BorderBeam size={160} duration={8} />}
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.name}</p>
              {p.featured && <Badge variant="soft">Most chosen</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">${price(p.price)}</span>
              <span className="text-sm text-muted-foreground">per seat / month</span>
            </p>
            <p className="mt-1 h-5 text-xs text-muted-foreground">{cycle === "yearly" && p.price > 0 ? `$${price(p.price) * 12} billed yearly` : ""}</p>
            <ul className="mt-6 grid flex-1 gap-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={p.featured ? "default" : "outline"} onClick={() => toast.success(`${p.name} selected`, { description: `Billed ${cycle}.` })}>
              {p.cta}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Sample pricing for the block. Replace with your own plans.</p>
    </div>
  );
}
