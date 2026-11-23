"use client";

import { useState } from "react";
import { Menubar } from "@/registry/ui/menubar";
import { toast } from "@/registry/ui/toast";

export default function MenubarDemo() {
  const [grid, setGrid] = useState(true);
  const [ruler, setRuler] = useState(false);
  const run = (l: string) => () => toast(l);
  return (
    <Menubar
      menus={[
        { label: "File", items: [{ label: "New file", shortcut: "⌘N", onSelect: run("New file") }, { label: "Open…", shortcut: "⌘O", onSelect: run("Open") }, { type: "separator" }, { label: "Save", shortcut: "⌘S", onSelect: run("Saved") }, { label: "Export as PNG", onSelect: run("Exported") }] },
        { label: "Edit", items: [{ label: "Undo", shortcut: "⌘Z" }, { label: "Redo", shortcut: "⇧⌘Z" }, { type: "separator" }, { label: "Cut", shortcut: "⌘X" }, { label: "Copy", shortcut: "⌘C" }, { label: "Paste", shortcut: "⌘V", disabled: true }] },
        { label: "View", items: [{ type: "checkbox", label: "Show grid", checked: grid, onCheckedChange: setGrid }, { type: "checkbox", label: "Show rulers", checked: ruler, onCheckedChange: setRuler }, { type: "separator" }, { label: "Zoom in", shortcut: "⌘+" }, { label: "Zoom out", shortcut: "⌘−" }] },
        { label: "Help", items: [{ label: "Keyboard shortcuts", shortcut: "?" }, { label: "Documentation" }] },
      ]}
    />
  );
}
