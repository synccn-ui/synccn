"use client";

import { useRef } from "react";
import { ScrollProgress } from "@/registry/ui/scroll-area";

const paras = [
  "Good components start with good defaults. A button should look right the moment you drop it in, and still bend to fit your brand.",
  "Accessibility is part of the default. Every interactive part has the right role, works with the keyboard and keeps a visible focus ring.",
  "Theming runs on CSS variables. Change one value and every component follows, in light and dark.",
  "Motion explains change. It's there when something opens, moves or confirms an action, and it steps aside when people ask for less.",
  "Copy the code, own the code. When we improve a component you can see the diff and decide what to take.",
];

export default function ScrollProgressDemo() {
  const box = useRef(null);
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm font-medium">
        Design principles
      </div>
      <ScrollProgress target={box} />
      <div ref={box} className="h-56 overflow-y-auto px-4 py-3 scrollbar-thin">
        {paras.concat(paras).map((p, i) => (
          <p key={i} className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
