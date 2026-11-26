"use client";

import { ChevronRight, FileText, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { Badge } from "@/registry/ui/badge";
import { ListItem } from "@/registry/ui/status-indicator";
import { toast } from "@/registry/ui/toast";

export default function ListItemDemo() {
  return (
    <div className="grid w-full max-w-md gap-1 rounded-2xl border p-1.5">
      <ListItem media={<Avatar name="synccn" size="md" status="online" />} title="synccn" description="synccn@example.com" actions={<Badge variant="secondary">Owner</Badge>} />
      <ListItem
        media={<Avatar name="synccn" size="md" />}
        title="synccn"
        description="synccn@example.com"
        actions={
          <button type="button" aria-label="More" className="grid size-8 place-items-center rounded-md hover:bg-accent">
            <MoreHorizontal className="size-4" />
          </button>
        }
      />
      <ListItem
        onClick={() => toast("Opening Q3 report")}
        media={
          <span className="grid size-10 place-items-center rounded-lg border bg-muted">
            <FileText className="size-4" />
          </span>
        }
        title="Q3 report.pdf"
        description="2.4 MB · Edited 3 days ago"
        actions={<ChevronRight className="size-4 text-muted-foreground" />}
      />
    </div>
  );
}
