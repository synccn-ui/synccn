"use client";

import { PricingCard } from "@/registry/ui/cards";
import { toast } from "@/registry/ui/toast";

export default function PricingCardDemo() {
  return (
    <div className="grid w-full max-w-2xl justify-items-center gap-4 pt-3 sm:grid-cols-2">
      <PricingCard name="Starter" price="$0" description="For trying things out." features={["3 projects", "Core components", "Community support"]} cta="Start free" onSelect={() => toast("Starter selected")} />
      <PricingCard featured badge="Most popular" name="Pro" price="$12" description="For shipping real products." features={["Unlimited projects", "All blocks and themes", "Priority support", "Early access"]} cta="Upgrade to Pro" onSelect={() => toast.success("Pro selected")} />
    </div>
  );
}
