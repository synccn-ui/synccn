"use client";

import { ImageCompare } from "@/registry/ui/image-compare";

/* Two illustrated scenes stand in for photos: the same landscape, before and after colour grading. */
const Scene = ({ graded }: { graded?: boolean }) => (
  <svg viewBox="0 0 400 240" className="block h-auto w-full" aria-hidden>
    <defs>
      <linearGradient id={graded ? "sky-a" : "sky-b"} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={graded ? "#ff9a5a" : "#9aa3ad"} />
        <stop offset="1" stopColor={graded ? "#ffd6a0" : "#c9ccd1"} />
      </linearGradient>
    </defs>
    <rect width="400" height="240" fill={`url(#${graded ? "sky-a" : "sky-b"})`} />
    <circle cx="300" cy="90" r="34" fill={graded ? "#fff3c4" : "#e3e4e6"} />
    <path d="M0 170 L80 110 L150 160 L230 90 L320 150 L400 120 L400 240 L0 240Z" fill={graded ? "#5b3a6e" : "#6b7077"} />
    <path d="M0 200 L100 160 L200 195 L300 165 L400 190 L400 240 L0 240Z" fill={graded ? "#2c2142" : "#4a4e54"} />
  </svg>
);

export default function ImageCompareDemo() {
  return (
    <div className="w-full max-w-lg">
      <ImageCompare before={<Scene />} after={<Scene graded />} beforeLabel="Original" afterLabel="Graded" />
    </div>
  );
}
