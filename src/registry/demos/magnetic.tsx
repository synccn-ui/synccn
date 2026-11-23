"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Magnetic } from "@/registry/ui/ripple-button";

export default function MagneticDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Magnetic>
        <Button size="lg" className="rounded-full">
          Get started <ArrowUpRight />
        </Button>
      </Magnetic>
      <Magnetic strength={0.5}>
        <span className="grid size-14 place-items-center rounded-full border bg-card shadow-sm">
          <ArrowUpRight className="size-5" />
        </span>
      </Magnetic>
    </div>
  );
}
