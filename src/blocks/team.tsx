"use client";

import type * as React from "react";
import { useState } from "react";
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { Avatar, type AvatarStatus } from "@/registry/ui/avatar";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { type DropdownMenuItem, DropdownMenu } from "@/registry/ui/dropdown-menu";
import { Input } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";
import { toast } from "@/registry/ui/toast";

const ROLES = [
  { value: "Owner", label: "Owner" },
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Viewer", label: "Viewer" },
];

interface Member {
  name: string;
  email: string;
  role: string;
  status?: AvatarStatus;
  invited?: boolean;
}

export default function TeamBlock() {
  const [members, setMembers] = useState<Member[]>([
    { name: "synccn", email: "synccn@example.com", role: "Owner", status: "online" },
  ]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  const [error, setError] = useState("");

  const invite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter an email like name@company.com.");
    if (members.some((m) => m.email === email)) return setError("That person is already on the team.");
    setMembers([...members, { name: email.split("@")[0].replace(/\W/g, " "), email, role, invited: true }]);
    setEmail("");
    setError("");
    toast.success("Invite sent", { description: email });
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border bg-card text-left">
      <div className="grid gap-1 border-b p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Team members</h2>
        <p className="text-sm text-muted-foreground">Invite people and choose what they can change.</p>
        <form onSubmit={invite} noValidate className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px_auto]">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" aria-label="Email to invite" invalid={!!error} />
          <Select aria-label="Role" value={role} onValueChange={setRole} options={ROLES.slice(1)} />
          <Button type="submit">
            <UserPlus /> Invite
          </Button>
        </form>
        {error && <p className="mt-1 text-[13px] text-destructive">{error}</p>}
      </div>
      <ul className="divide-y">
        {members.map((m) => (
          <li key={m.email} className="flex animate-fade items-center gap-3 px-5 py-3.5 sm:px-6">
            <Avatar name={m.name} status={m.status} size="md" />
            <div className="grid min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium capitalize">
                {m.name} {m.invited && <Badge variant="soft">Invited</Badge>}
              </p>
              <p className="truncate text-[13px] text-muted-foreground">{m.email}</p>
            </div>
            <span className="hidden text-sm text-muted-foreground sm:block">{m.role}</span>
            <DropdownMenu
              align="end"
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${m.name}`} disabled={m.role === "Owner"}>
                  <MoreHorizontal />
                </Button>
              }
              items={[
                { type: "label", label: "Change role" } as DropdownMenuItem,
                ...ROLES.slice(1).map((r): DropdownMenuItem => ({
                  type: "checkbox",
                  label: r.label,
                  checked: m.role === r.value,
                  onCheckedChange: () => setMembers(members.map((x) => (x.email === m.email ? { ...x, role: r.value } : x))),
                })),
                { type: "separator" } as DropdownMenuItem,
                {
                  label: "Remove from team",
                  icon: Trash2,
                  destructive: true,
                  onSelect: () => {
                    setMembers(members.filter((x) => x.email !== m.email));
                    toast(`Removed ${m.email}`, { action: { label: "Undo", onClick: () => setMembers((cur) => [...cur, m]) } });
                  },
                },
              ]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
