"use client";

import { useState } from "react";
import { SearchField } from "@/registry/ui/search-field";

const topics = ["Button", "Button Group", "Calendar", "Card", "Carousel", "Checkbox", "Command", "Data Table", "Date Picker", "Dialog", "Drawer", "Dropdown Menu", "Sidebar", "Tabs", "Toast", "Tooltip"];

export default function SearchFieldDemo() {
  const [last, setLast] = useState("");
  return (
    <div className="grid w-full max-w-sm gap-2">
      <SearchField suggestions={topics} recent={["Dialog", "Data Table", "Theming"]} onSearch={setLast} placeholder="Search docs" />
      <p className="text-[13px] text-muted-foreground">{last ? `Searched for “${last}”` : "Press / anywhere to jump here."}</p>
    </div>
  );
}
