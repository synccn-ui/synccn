"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input, Label } from "@/registry/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">
          <SlidersHorizontal /> Dimensions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-3">
        <div className="grid gap-1">
          <p className="text-sm font-semibold">Dimensions</p>
          <p className="text-[13px] text-muted-foreground">Set the size of the layer.</p>
        </div>
        {[
          ["Width", "100%"],
          ["Max width", "640px"],
          ["Height", "auto"],
        ].map(([l, v]) => (
          <div key={l} className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor={`pop-${l}`}>{l}</Label>
            <Input id={`pop-${l}`} defaultValue={v} className="col-span-2 h-8" />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
