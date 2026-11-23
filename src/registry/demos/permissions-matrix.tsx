"use client";

import { useState } from "react";
import { PermissionsMatrix, type PermissionGrants, type PermissionGroup, type PermissionRole } from "@/registry/ui/permissions-matrix";
import { toast } from "@/registry/ui/toast";

const roles: PermissionRole[] = [
  { id: "viewer", name: "Viewer" },
  { id: "editor", name: "Editor", inherits: "viewer" },
  { id: "admin", name: "Admin", inherits: "editor" },
];

const groups: PermissionGroup[] = [
  {
    id: "projects",
    label: "Projects",
    permissions: [
      { id: "projects.read", label: "View projects" },
      { id: "projects.write", label: "Create and edit projects" },
      { id: "projects.delete", label: "Delete projects", description: "Can't be undone after 30 days.", disabledFor: ["viewer"] },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    permissions: [
      { id: "billing.read", label: "View invoices" },
      { id: "billing.manage", label: "Change plan and payment method", disabledFor: ["viewer", "editor"] },
    ],
  },
  {
    id: "members",
    label: "Members",
    permissions: [
      { id: "members.invite", label: "Invite people" },
      { id: "members.roles", label: "Change roles", disabledFor: ["viewer"] },
    ],
  },
];

const SAVED: PermissionGrants = { viewer: ["projects.read", "billing.read"], editor: ["projects.write"], admin: ["projects.delete", "billing.manage", "members.invite", "members.roles"] };

export default function PermissionsMatrixDemo() {
  const [saved, setSaved] = useState(SAVED);
  const [grants, setGrants] = useState(SAVED);
  return (
    <PermissionsMatrix
      className="w-full"
      roles={roles}
      groups={groups}
      value={grants}
      onValueChange={setGrants}
      saved={saved}
      onDiscard={() => setGrants(saved)}
      onSave={(g) => {
        setSaved(g);
        toast.success("Permissions saved");
      }}
    />
  );
}
