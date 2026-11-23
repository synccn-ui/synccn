"use client";

import { Camera, FileText, FolderPlus, Mic } from "lucide-react";
import { SpeedDial } from "@/registry/ui/nav-extras";
import { toast } from "@/registry/ui/toast";

export default function SpeedDialDemo() {
  const go = (l: string) => () => toast(l);
  return (
    <div className="flex h-80 w-full max-w-xs items-end justify-end rounded-xl border bg-muted/20 p-4">
      <SpeedDial
        actions={[
          { label: "New folder", icon: FolderPlus, onClick: go("New folder") },
          { label: "New note", icon: FileText, onClick: go("New note") },
          { label: "Voice memo", icon: Mic, onClick: go("Recording…") },
          { label: "Scan", icon: Camera, onClick: go("Opening camera") },
        ]}
      />
    </div>
  );
}
