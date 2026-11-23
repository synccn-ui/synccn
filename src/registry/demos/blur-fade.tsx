"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BlurFade } from "@/registry/ui/blur-fade";
import { Button } from "@/registry/ui/button";

const hues = [250, 300, 30, 160, 200, 340];

export default function BlurFadeDemo() {
  const [k, setK] = useState(0);
  return (
    <div className="grid w-full max-w-md justify-items-center gap-4">
      <div key={k} className="grid w-full grid-cols-3 gap-2">
        {hues.map((h, i) => (
          <BlurFade key={h} delay={i * 90}>
            <div className="aspect-square rounded-xl" style={{ background: `radial-gradient(circle at 30% 20%, oklch(0.75 0.14 ${h}), oklch(0.4 0.12 ${h + 20}))` }} />
          </BlurFade>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => setK(k + 1)}>
        <RotateCcw /> Replay
      </Button>
    </div>
  );
}
