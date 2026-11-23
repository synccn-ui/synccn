"use client";

import { useState } from "react";
import { Checkbox } from "@/registry/ui/checkbox";

const items = ["Email digests", "Push notifications", "Product updates"];

export default function CheckboxDemo() {
  const [on, setOn] = useState(["Email digests"]);
  const all = on.length === items.length ? true : on.length ? "indeterminate" : false;
  return (
    <div className="grid gap-4">
      <Checkbox label="All notifications" checked={all} onCheckedChange={() => setOn(all === true ? [] : items)} />
      <div className="grid gap-3 border-l pl-5">
        {items.map((it) => (
          <Checkbox key={it} label={it} checked={on.includes(it)} onCheckedChange={(v) => setOn(v ? [...on, it] : on.filter((x) => x !== it))} />
        ))}
      </div>
      <Checkbox label="Accept terms" description="You agree to our terms of service and privacy policy." defaultChecked />
    </div>
  );
}
