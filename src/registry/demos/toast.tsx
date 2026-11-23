"use client";

import { Button } from "@/registry/ui/button";
import { toast } from "@/registry/ui/toast";

export default function ToastDemo() {
  return (
    <div className="flex max-w-md flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast("Event created", { description: "Sunday, December 3 at 9:00 AM" })}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Changes saved")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Couldn't publish", { description: "Check your connection and try again." })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast("Message archived", { action: { label: "Undo", onClick: () => toast.success("Restored") } })}>
        With action
      </Button>
      <Button
        onClick={() =>
          toast.promise(new Promise((res) => setTimeout(res, 1800)), {
            loading: "Uploading 3 files…",
            success: "Upload complete",
            error: "Upload failed",
          })
        }
      >
        Promise
      </Button>
    </div>
  );
}
