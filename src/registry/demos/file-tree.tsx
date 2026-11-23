"use client";

import { useState } from "react";
import { FileTree } from "@/registry/ui/file-tree";

const data = [
  {
    name: "src",
    children: [
      { name: "components", children: [{ name: "ui", children: [{ name: "button.jsx" }, { name: "dialog.jsx" }, { name: "toast.jsx" }] }, { name: "header.jsx" }] },
      { name: "lib", children: [{ name: "utils.js" }, { name: "hooks.js" }] },
      { name: "app.jsx" },
      { name: "index.css" },
    ],
  },
  { name: "public", children: [{ name: "logo.svg" }, { name: "og.png" }] },
  { name: "package.json" },
  { name: "README.md" },
];

export default function FileTreeDemo() {
  const [file, setFile] = useState("src/components/ui/button.jsx");
  return (
    <div className="grid w-full max-w-xs gap-2">
      <FileTree data={data} defaultExpanded={["src", "src/components", "src/components/ui"]} onSelect={setFile} />
      <p className="truncate font-mono text-xs text-muted-foreground">Selected: {file}</p>
    </div>
  );
}
