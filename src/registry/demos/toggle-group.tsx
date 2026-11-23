"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup } from "@/registry/ui/toggle-group";

export default function ToggleGroupDemo() {
  return (
    <div className="grid justify-items-center gap-4">
      <ToggleGroup
        defaultValue="month"
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
        ]}
      />
      <div className="flex flex-wrap justify-center gap-3">
        <ToggleGroup
          defaultValue="left"
          options={[
            { value: "left", icon: AlignLeft, "aria-label": "Align left" },
            { value: "center", icon: AlignCenter, "aria-label": "Align centre" },
            { value: "right", icon: AlignRight, "aria-label": "Align right" },
          ]}
        />
        <ToggleGroup
          type="multiple"
          defaultValue={["bold"]}
          options={[
            { value: "bold", icon: Bold, "aria-label": "Bold" },
            { value: "italic", icon: Italic, "aria-label": "Italic" },
            { value: "underline", icon: Underline, "aria-label": "Underline" },
          ]}
        />
      </div>
    </div>
  );
}
