"use client";

import { Copy, Link2, Pencil, Trash2 } from "lucide-react";
import { ContextMenu } from "@/registry/ui/context-menu";
import { toast } from "@/registry/ui/toast";

export default function ContextMenuDemo() {
  return (
    <ContextMenu
      className="w-full max-w-sm"
      items={[
        { label: "Rename", icon: Pencil, shortcut: "F2", onSelect: () => toast("Rename selected") },
        { label: "Duplicate", icon: Copy, shortcut: "⌘D", onSelect: () => toast.success("File duplicated") },
        { label: "Copy link", icon: Link2, onSelect: () => toast.success("Link copied") },
        { type: "separator" },
        { label: "Move to trash", icon: Trash2, destructive: true, onSelect: () => toast.error("Moved to trash") },
      ]}
    >
      <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed text-sm text-muted-foreground select-none">
        Right-click here, or long-press on touch
      </div>
    </ContextMenu>
  );
}
