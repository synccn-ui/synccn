"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { TextAnimate } from "@/registry/ui/aurora";

export default function TextAnimateDemo() {
  const [k, setK] = useState(0);
  return (
    <div key={k} className="grid max-w-lg justify-items-center gap-5 text-center">
      <TextAnimate text="Ship interfaces people love to use" className="text-4xl font-semibold tracking-tighter" />
      <TextAnimate text="Letter by letter" by="letter" stagger={35} className="text-lg text-muted-foreground" />
      <Button size="sm" variant="outline" onClick={() => setK(k + 1)}>
        <RotateCcw /> Replay
      </Button>
    </div>
  );
}
