"use client";

import { Avatar } from "@/registry/ui/avatar";
import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { DataTable } from "@/registry/ui/data-table";

const people = [
  { id: 1, name: "Michael", email: "michael@example.com", role: "Owner", status: "Active", spend: 1240 },
  { id: 2, name: "Riley", email: "riley@example.com", role: "Admin", status: "Active", spend: 860 },
  { id: 3, name: "Jayden", email: "jayden@example.com", role: "Editor", status: "Invited", spend: 0 },
];
const tone: Record<string, BadgeVariant> = { Active: "success", Invited: "soft", Suspended: "destructive" };

export default function DataTableDemo() {
  return (
    <DataTable
      className="max-w-3xl"
      data={people}
      pageSize={5}
      searchKeys={["name", "email", "role"]}
      columns={[
        {
          key: "name",
          header: "Member",
          sortable: true,
          hideable: false,
          cell: (r) => (
            <div className="flex items-center gap-2.5">
              <Avatar name={r.name} size="sm" />
              <div className="grid">
                <span className="font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.email}</span>
              </div>
            </div>
          ),
        },
        { key: "role", header: "Role", sortable: true },
        { key: "status", header: "Status", sortable: true, cell: (r) => <Badge variant={tone[r.status]} dot>{r.status}</Badge> },
        { key: "spend", header: "Spend", sortable: true, align: "right", cell: (r) => `$${r.spend.toLocaleString()}` },
      ]}
    />
  );
}
