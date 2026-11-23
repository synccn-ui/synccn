"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { confetti } from "@/registry/ui/confetti";

export default function ConfettiDemo() {
  return (
    <div className="grid justify-items-center gap-3">
      <Button
        size="lg"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          confetti({ x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight });
        }}
      >
        <PartyPopper /> Celebrate
      </Button>
      <p className="text-[13px] text-muted-foreground">Bursts from the button. Off when reduced motion is on.</p>
    </div>
  );
}
