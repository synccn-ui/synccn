"use client";

import { useState } from "react";
import { AlertDialog } from "@/registry/ui/alert-dialog";
import { Button } from "@/registry/ui/button";
import { toast } from "@/registry/ui/toast";

export default function AlertDialogDemo() {
  const [open, setOpen] = useState<"leave" | "delete" | null>(null);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => setOpen("leave")}>
        Leave without saving
      </Button>
      <Button variant="destructive" onClick={() => setOpen("delete")}>
        Delete repository
      </Button>
      <AlertDialog
        open={open === "leave"}
        onOpenChange={() => setOpen(null)}
        title="Leave without saving?"
        description="You have unsaved changes. They'll be lost if you leave now."
        cancelLabel="Keep editing"
        confirmLabel="Leave"
        onConfirm={() => toast("Changes discarded")}
      />
      <AlertDialog
        open={open === "delete"}
        onOpenChange={() => setOpen(null)}
        destructive
        title="Delete this repository?"
        description="This permanently deletes the repository, its issues and its history."
        confirmText="web-app"
        confirmLabel="Delete repository"
        onConfirm={() => new Promise((r) => setTimeout(r, 900)).then(() => toast.error("Repository deleted"))}
      />
    </div>
  );
}
