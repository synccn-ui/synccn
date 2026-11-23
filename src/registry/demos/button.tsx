"use client";

import { useState } from "react";
import { ArrowUpRight, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/registry/ui/button";

export default function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex max-w-md flex-wrap items-center justify-center gap-2.5">
      <Button>
        <Plus /> New project
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">
        <Download /> Export
      </Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">
        Read the docs <ArrowUpRight />
      </Button>
      <Button variant="destructive" size="icon" aria-label="Delete">
        <Trash2 />
      </Button>
      <Button
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1500);
        }}
      >
        {saving ? "Saving" : "Save changes"}
      </Button>
    </div>
  );
}
