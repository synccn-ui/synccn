"use client";

import { Carousel } from "@/registry/ui/carousel";

const slides = [
  { title: "Components", hue: 250 },
  { title: "Blocks", hue: 300 },
  { title: "Themes", hue: 30 },
  { title: "Motion", hue: 160 },
  { title: "Charts", hue: 200 },
];

export default function CarouselDemo() {
  return (
    <div className="grid w-full max-w-lg gap-10 px-4">
      <Carousel autoplay={3500}>
        {slides.map((s) => (
          <div key={s.title} className="grid aspect-[16/9] place-items-center rounded-xl text-2xl font-semibold text-white" style={{ background: `radial-gradient(circle at 30% 20%, oklch(0.7 0.15 ${s.hue}), oklch(0.35 0.12 ${s.hue + 30}))` }}>
            {s.title}
          </div>
        ))}
      </Carousel>
      <Carousel perView={3} gap={10} loop={false}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid aspect-square place-items-center rounded-xl border bg-card text-lg font-semibold tabular-nums">
            {i + 1}
          </div>
        ))}
      </Carousel>
    </div>
  );
}
