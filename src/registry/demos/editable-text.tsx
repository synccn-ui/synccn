"use client";

import { EditableText } from "@/registry/ui/editable-text";

export default function EditableTextDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4 rounded-xl border p-5">
      <EditableText as="h3" defaultValue="Q3 product roadmap" className="text-lg font-semibold" />
      <div className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Owner</span>
        <EditableText defaultValue="Michael" />
      </div>
      <div className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Budget</span>
        <EditableText defaultValue="$12,000" validate={(v) => (/^\$?[\d,]+(\.\d+)?$/.test(v) ? "" : "Enter an amount like $12,000.")} />
      </div>
      <p className="text-xs text-muted-foreground">Click any value to edit. Enter saves, Esc cancels.</p>
    </div>
  );
}
