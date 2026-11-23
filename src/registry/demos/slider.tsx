"use client";

import { useState } from "react";
import { Volume1, Volume2 } from "lucide-react";
import { Slider } from "@/registry/ui/slider";

export default function SliderDemo() {
  const [vol, setVol] = useState([64]);
  const [price, setPrice] = useState([40, 180]);
  return (
    <div className="grid w-full max-w-sm gap-8">
      <div className="flex items-center gap-3">
        <Volume1 className="size-4 text-muted-foreground" />
        <Slider value={vol} onValueChange={setVol} aria-label="Volume" showValue />
        <Volume2 className="size-4 text-muted-foreground" />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Price range</span>
          <span className="tabular-nums text-muted-foreground">
            ${price[0]} – ${price[1]}
          </span>
        </div>
        <Slider value={price} onValueChange={setPrice} min={0} max={250} step={5} aria-label="Price" />
      </div>
    </div>
  );
}
