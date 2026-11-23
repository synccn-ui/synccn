"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Copy, Minus, Plus, Scissors, ClipboardPaste } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { ButtonGroup } from "@/registry/ui/button-group";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";
import { toast } from "@/registry/ui/toast";

export default function ButtonGroupDemo() {
  return (
    <div className="grid justify-items-center gap-5">
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous">
          <ChevronLeft />
        </Button>
        <Button variant="outline">Today</Button>
        <Button variant="outline" size="icon" aria-label="Next">
          <ChevronRight />
        </Button>
      </ButtonGroup>
      <div className="flex">
        <Button className="rounded-r-none" onClick={() => toast.success("Changes published")}>
          Publish
        </Button>
        <DropdownMenu
          align="end"
          trigger={
            <Button className="rounded-l-none border-l border-primary-foreground/20 px-2.5" aria-label="More publish options">
              <ChevronDown />
            </Button>
          }
          items={[{ label: "Schedule for later" }, { label: "Publish as draft" }, { type: "separator" }, { label: "Discard changes", destructive: true }]}
        />
      </div>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          <Scissors /> Cut
        </Button>
        <Button variant="outline" size="sm">
          <Copy /> Copy
        </Button>
        <Button variant="outline" size="sm">
          <ClipboardPaste /> Paste
        </Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline" size="icon" aria-label="Zoom in">
          <Plus />
        </Button>
        <Button variant="outline" size="icon" aria-label="Zoom out">
          <Minus />
        </Button>
      </ButtonGroup>
    </div>
  );
}
