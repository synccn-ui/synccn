"use client";

import { useState } from "react";
import { ColorPicker } from "@/registry/ui/color-picker";

export default function ColorPickerDemo() {
  const [color, setColor] = useState("#2f7ed8");
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <ColorPicker value={color} onValueChange={setColor} />
      <div className="grid w-44 gap-2">
        <div className="h-20 rounded-xl border" style={{ background: color }} />
        <button type="button" className="h-9 rounded-md text-sm font-medium text-white" style={{ background: color }}>
          Button preview
        </button>
        <p className="font-mono text-xs uppercase text-muted-foreground">{color}</p>
      </div>
    </div>
  );
}
