"use client";

import { useRef } from "react";
import { BackToTop } from "@/registry/ui/nav-extras";

export default function BackToTopDemo() {
  const box = useRef(null);
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-xl border">
      <div ref={box} className="h-72 overflow-y-auto p-5 scrollbar-thin">
        <p className="mb-4 text-sm font-medium">Scroll down in this panel</p>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="mb-3 h-14 rounded-lg bg-muted/60" />
        ))}
      </div>
      <BackToTop target={box} threshold={120} className="absolute bottom-4 right-4" />
    </div>
  );
}
