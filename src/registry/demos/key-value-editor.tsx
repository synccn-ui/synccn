"use client";

import { useState } from "react";
import { KeyValueEditor, type KeyValuePair } from "@/registry/ui/key-value-editor";

export default function KeyValueEditorDemo() {
  const [vars, setVars] = useState<KeyValuePair[]>([
    { id: "1", key: "DATABASE_URL", value: "postgres://app:hunter2@db.internal:5432/app", secret: true },
    { id: "2", key: "NEXT_PUBLIC_APP_URL", value: "https://app.example.com" },
    { id: "3", key: "LOG_LEVEL", value: "info" },
  ]);
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 grid gap-0.5">
        <p className="text-sm font-semibold">Environment variables</p>
        <p className="text-[13px] text-muted-foreground">Production · {vars.filter((v) => v.key).length} variables</p>
      </div>
      <KeyValueEditor value={vars} onValueChange={setVars} />
    </div>
  );
}
