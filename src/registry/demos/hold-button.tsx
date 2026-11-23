"use client";

import { HoldButton } from "@/registry/ui/loaders";
import { toast } from "@/registry/ui/toast";

export default function HoldButtonDemo() {
  return (
    <div className="grid justify-items-center gap-4">
      <HoldButton onConfirm={() => toast.error("Workspace deleted")}>Hold to delete workspace</HoldButton>
      <HoldButton variant="default" duration={1000} onConfirm={() => toast.success("Deployed to production")}>
        Hold to deploy
      </HoldButton>
      <p className="text-xs text-muted-foreground">Press and hold, or hold Space. Let go early to cancel.</p>
    </div>
  );
}
