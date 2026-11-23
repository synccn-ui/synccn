"use client";

import { Lightbox } from "@/registry/ui/lightbox";

/* Generated scenes stand in for photos. */
const scene = (h: number, i: number) => `radial-gradient(circle at ${20 + i * 12}% 30%, oklch(0.78 0.13 ${h}), oklch(0.32 0.1 ${h + 40}))`;
const photos = [250, 30, 160, 320, 200, 80].map((h, i) => ({
  id: String(i),
  caption: ["Harbour at dawn", "Desert road", "Pine forest", "City lights", "Glacier lake", "Wheat field"][i],
  thumb: <span className="block size-full" style={{ background: scene(h, i) }} />,
  full: <span className="block aspect-[3/2] w-full rounded-lg" style={{ background: scene(h, i) }} />,
}));

export default function LightboxDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Lightbox items={photos} />
      <p className="text-center text-xs text-muted-foreground">Click an image. Use ← → to browse and Esc to close.</p>
    </div>
  );
}
