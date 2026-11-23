"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { Dialog } from "@/registry/ui/dialog";
import { Input, Label } from "@/registry/ui/input";
import { toast } from "@/registry/ui/toast";

export default function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState("My workspace");
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit workspace
      </Button>
      <Button variant="destructive" onClick={() => setConfirm(true)}>
        Delete project
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Edit workspace"
        description="Changes apply to everyone in the workspace."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast.success("Workspace saved", { description: `Renamed to ${name}.` });
              }}
            >
              Save workspace
            </Button>
          </>
        }
      >
        <div className="grid gap-2">
          <Label htmlFor="dlg-name">Workspace name</Label>
          <Input id="dlg-name" value={name} onChange={(e) => setName(e.target.value)} data-autofocus />
        </div>
      </Dialog>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        size="sm"
        title="Delete this project?"
        description="The project and its 24 components will be removed. You can't undo this."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Keep project
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirm(false);
                toast.error("Project deleted");
              }}
            >
              Delete project
            </Button>
          </>
        }
      />
    </div>
  );
}
