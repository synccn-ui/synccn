"use client";

import { Bold, Bookmark, Italic, Star } from "lucide-react";
import { Toggle } from "@/registry/ui/toggle";

export default function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Toggle aria-label="Bold" defaultPressed>
        <Bold />
      </Toggle>
      <Toggle aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle variant="outline">
        <Bookmark /> Save
      </Toggle>
      <Toggle variant="outline" size="sm" defaultPressed>
        <Star /> Starred
      </Toggle>
    </div>
  );
}
