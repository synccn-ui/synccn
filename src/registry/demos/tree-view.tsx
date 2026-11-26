"use client";

import { useState } from "react";
import { Bell, CreditCard, FolderKanban, Users } from "lucide-react";
import { TreeView, type TreeNode } from "@/registry/ui/tree-view";

const data: TreeNode[] = [
  { id: "projects", label: "Projects", icon: FolderKanban, children: [{ id: "projects.view", label: "View projects" }, { id: "projects.edit", label: "Edit projects" }, { id: "projects.delete", label: "Delete projects" }] },
  { id: "team", label: "Team", icon: Users, children: [{ id: "team.invite", label: "Invite members" }, { id: "team.roles", label: "Change roles" }, { id: "team.remove", label: "Remove members", disabled: true }] },
  { id: "billing", label: "Billing", icon: CreditCard, children: [{ id: "billing.invoices", label: "View invoices" }, { id: "billing.plan", label: "Change plan" }] },
  { id: "notify", label: "Notifications", icon: Bell, children: [{ id: "notify.email", label: "Email" }, { id: "notify.slack", label: "Slack" }] },
];

export default function TreeViewDemo() {
  const [checked, setChecked] = useState(["projects.view", "projects.edit", "team.invite"]);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <TreeView aria-label="Editor permissions" data={data} value={checked} onValueChange={setChecked} defaultExpanded={["projects", "team"]} />
      <p className="text-center text-[13px] text-muted-foreground">{checked.length} permissions granted</p>
    </div>
  );
}
