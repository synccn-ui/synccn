"use client";

import { useState } from "react";
import { TransferList, type TransferItem } from "@/registry/ui/transfer-list";

const scopes: TransferItem[] = [
  { value: "projects:read", label: "projects:read", description: "List and view projects" },
  { value: "projects:write", label: "projects:write", description: "Create and edit projects" },
  { value: "deployments:read", label: "deployments:read", description: "View deployments and logs" },
  { value: "deployments:write", label: "deployments:write", description: "Trigger and roll back deploys" },
  { value: "env:read", label: "env:read", description: "Read environment variables" },
  { value: "env:write", label: "env:write", description: "Change environment variables" },
  { value: "billing:read", label: "billing:read", description: "View invoices" },
  { value: "team:admin", label: "team:admin", description: "Owners only", disabled: true },
];

export default function TransferListDemo() {
  const [granted, setGranted] = useState(["projects:read", "deployments:read"]);
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <TransferList items={scopes} value={granted} onValueChange={setGranted} titles={["Available scopes", "Token scopes"]} height={220} />
      <p className="text-center text-[13px] text-muted-foreground">
        {granted.length} {granted.length === 1 ? "scope" : "scopes"} on this token · double-click to move one
      </p>
    </div>
  );
}
