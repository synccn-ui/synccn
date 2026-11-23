"use client";

import { useMemo, useState } from "react";
import { Filter, KeyRound, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { ActivityTimeline, type ActivityEvent } from "@/registry/ui/activity-timeline";
import { Avatar } from "@/registry/ui/avatar";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { DataView, type DataViewColumn } from "@/registry/ui/data-view";
import { Dialog } from "@/registry/ui/dialog";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";
import { FilterBuilder, countRules, emptyFilter, matchesFilter, type FilterField, type FilterGroup } from "@/registry/ui/filter-builder";
import { Input } from "@/registry/ui/input";
import { InspectorDrawer, InspectorProperties } from "@/registry/ui/inspector-drawer";
import { PermissionsMatrix, type PermissionGrants, type PermissionGroup, type PermissionRole } from "@/registry/ui/permissions-matrix";
import { Select } from "@/registry/ui/select";
import { Switch } from "@/registry/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";
import { toast } from "@/registry/ui/toast";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "viewer" | "editor" | "admin";
  status: "Active" | "Invited" | "Suspended";
  mfa: boolean;
  lastSeen: number;
}

const ROLE_NAMES = { viewer: "Viewer", editor: "Editor", admin: "Admin" } as const;
const NAMES = ["Michael Stone", "Riley Park", "Jayden Reyes", "Avery Lin", "Jordan Okafor", "Casey Novak", "Morgan Ibarra", "Quinn Shah", "Harper Stone", "Rowan Park", "Sky Reyes", "Drew Lin"];
const MEMBERS: Member[] = NAMES.map((name, i) => ({
  id: `usr_${i + 1}`,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@acme.dev`,
  role: (["admin", "editor", "editor", "viewer"] as const)[i % 4],
  status: i === 9 ? "Suspended" : "Active",
  mfa: i % 3 !== 2,
  lastSeen: [3, 40, 120, 600, 1500, 2900][i % 6],
}));

const roles: PermissionRole[] = [
  { id: "viewer", name: "Viewer" },
  { id: "editor", name: "Editor", inherits: "viewer" },
  { id: "admin", name: "Admin", inherits: "editor" },
];
const permissionGroups: PermissionGroup[] = [
  { id: "proj", label: "Projects", permissions: [{ id: "proj.read", label: "View projects" }, { id: "proj.write", label: "Edit projects" }, { id: "proj.delete", label: "Delete projects", disabledFor: ["viewer"] }] },
  { id: "team", label: "Team", permissions: [{ id: "team.invite", label: "Invite members" }, { id: "team.roles", label: "Change roles", disabledFor: ["viewer", "editor"] }] },
  { id: "billing", label: "Billing", permissions: [{ id: "billing.read", label: "View invoices" }, { id: "billing.manage", label: "Manage subscription", disabledFor: ["viewer", "editor"] }] },
];
const GRANTS: PermissionGrants = { viewer: ["proj.read"], editor: ["proj.write", "team.invite"], admin: ["proj.delete", "team.roles", "billing.read", "billing.manage"] };

const fields: FilterField[] = [
  { key: "role", label: "Role", type: "select", options: Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label })) },
  { key: "status", label: "Status", type: "select", options: ["Active", "Invited", "Suspended"].map((v) => ({ value: v, label: v })) },
  { key: "mfa", label: "Two-factor", type: "boolean" },
  { key: "email", label: "Email", type: "text" },
];

const seen = (m: number) => (m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`);

export default function SaasAdminBlock() {
  const now = useNow();
  const [members, setMembers] = useState(MEMBERS);
  const [filter, setFilter] = useState<FilterGroup>(emptyFilter());
  const [showFilters, setShowFilters] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: "editor" });
  const [selected, setSelected] = useState<Member | null>(null);
  const [saved, setSaved] = useState(GRANTS);
  const [grants, setGrants] = useState(GRANTS);
  const [org, setOrg] = useState({ name: "Acme", sso: false, mfa: true });
  const [log, setLog] = useState<{ id: string; actor: string; action: string; target: string; minutes: number; status?: ActivityEvent["status"] }[]>([
    { id: "a1", actor: "Michael Stone", action: "changed the role of", target: "Riley Park to Editor", minutes: 35 },
    { id: "a2", actor: "Avery Lin", action: "signed in from a new device", target: "", minutes: 190, status: "warning" },
    { id: "a3", actor: "Michael Stone", action: "suspended", target: "Rowan Park", minutes: 1600, status: "error" },
  ]);
  const record = (action: string, target: string, status?: ActivityEvent["status"]) => setLog((l) => [{ id: `a${l.length + 1}-${target}`, actor: "You", action, target, minutes: 0, status }, ...l]);

  const events = useMemo<ActivityEvent[]>(() => {
    const t = now ? now.getTime() : Date.UTC(2026, 10, 23, 12);
    return log.map((e) => ({ id: e.id, actor: { name: e.actor }, action: e.action, target: e.target || undefined, time: new Date(t - e.minutes * 60000), status: e.status }));
  }, [log, now]);

  const matcher = useMemo(() => (m: Member) => matchesFilter(m as unknown as Record<string, unknown>, filter, fields), [filter]);
  const activeRules = countRules(filter);

  const setRole = (ids: string[], role: Member["role"]) => {
    setMembers((all) => all.map((m) => (ids.includes(m.id) ? { ...m, role } : m)));
    record("changed the role of", `${ids.length} ${ids.length === 1 ? "member" : "members"} to ${ROLE_NAMES[role]}`);
    toast.success(`Updated ${ids.length} ${ids.length === 1 ? "member" : "members"}`);
  };

  const columns: DataViewColumn<Member>[] = [
    {
      key: "name",
      header: "Member",
      sortable: true,
      hideable: false,
      width: 240,
      cell: (m) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={m.name} size="xs" />
          <span className="grid min-w-0">
            <span className="truncate font-medium">{m.name}</span>
            <span className="truncate text-xs text-muted-foreground">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: "role", header: "Role", sortable: true, width: 110, value: (m) => ROLE_NAMES[m.role], cell: (m) => <Badge variant={m.role === "admin" ? "default" : "secondary"}>{ROLE_NAMES[m.role]}</Badge> },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: 120,
      cell: (m) => (
        <Badge variant={m.status === "Active" ? "success" : m.status === "Invited" ? "warning" : "outline"} dot>
          {m.status}
        </Badge>
      ),
    },
    { key: "mfa", header: "2FA", width: 80, value: (m) => (m.mfa ? "On" : "Off"), cell: (m) => (m.mfa ? <ShieldCheck className="size-4 text-success" aria-label="On" /> : <span className="text-xs text-muted-foreground">Off</span>) },
    { key: "lastSeen", header: "Last seen", sortable: true, align: "right", width: 110, cell: (m) => (m.status === "Invited" ? "—" : seen(m.lastSeen)) },
  ];

  return (
    <div className="grid w-full max-w-6xl gap-5 rounded-2xl border bg-background p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{org.name} admin</h2>
          <p className="text-sm text-muted-foreground">
            {members.filter((m) => m.status === "Active").length} active members · {members.filter((m) => m.status === "Invited").length} pending invites
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus /> Invite
        </Button>
      </header>

      <Tabs defaultValue="members" variant="underline">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles and permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="grid gap-3 pt-4">
          {showFilters && <FilterBuilder fields={fields} value={filter} onValueChange={setFilter} maxDepth={2} />}
          <DataView
            columns={columns}
            data={members}
            rowKey={(m) => m.id}
            filter={matcher}
            selectable
            onRowClick={setSelected}
            label="Members"
            searchPlaceholder="Search members…"
            toolbar={
              <Button variant={activeRules ? "secondary" : "outline"} size="sm" aria-expanded={showFilters} onClick={() => setShowFilters((s) => !s)}>
                <Filter /> Filters{activeRules ? ` (${activeRules})` : ""}
              </Button>
            }
            bulkActions={(rows, clear) => (
              <>
                <DropdownMenu
                  trigger={
                    <Button size="sm" variant="outline">
                      <KeyRound /> Change role
                    </Button>
                  }
                  items={(Object.keys(ROLE_NAMES) as Member["role"][]).map((r) => ({ label: ROLE_NAMES[r], onSelect: () => (setRole(rows.map((m) => m.id), r), clear()) }))}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMembers((all) => all.map((m) => (rows.some((r) => r.id === m.id) ? { ...m, status: "Suspended" } : m)));
                    record("suspended", `${rows.length} ${rows.length === 1 ? "member" : "members"}`, "error");
                    clear();
                  }}
                >
                  <UserMinus /> Suspend
                </Button>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="roles" className="pt-4">
          <PermissionsMatrix
            roles={roles}
            groups={permissionGroups}
            value={grants}
            onValueChange={setGrants}
            saved={saved}
            onDiscard={() => setGrants(saved)}
            onSave={(g) => {
              setSaved(g);
              record("updated permissions for", "all roles");
              toast.success("Permissions saved");
            }}
          />
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <ActivityTimeline events={events} />
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <form
            className="grid max-w-lg gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              record("updated organization settings", "");
              toast.success("Settings saved");
            }}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              Organization name
              <Input value={org.name} onChange={(e) => setOrg((o) => ({ ...o, name: e.target.value }))} required />
            </label>
            <Switch checked={org.mfa} onCheckedChange={(mfa) => setOrg((o) => ({ ...o, mfa }))} label="Require two-factor sign-in for everyone" />
            <Switch checked={org.sso} onCheckedChange={(sso) => setOrg((o) => ({ ...o, sso }))} label="Single sign-on (SAML)" />
            {org.sso && <p className="-mt-3 text-sm text-muted-foreground">Connect your identity provider to finish. Members keep their passwords until SSO is verified.</p>}
            <Button type="submit" className="w-fit">
              Save settings
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <Dialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite a member"
        description="They'll get an email with a link that expires in 7 days."
        footer={
          <Button
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email) || members.some((m) => m.email === invite.email)}
            onClick={() => {
              const name = invite.email.split("@")[0];
              setMembers((all) => [...all, { id: `usr_${all.length + 1}`, name, email: invite.email, role: invite.role as Member["role"], status: "Invited", mfa: false, lastSeen: 0 }]);
              record("invited", invite.email, "info");
              toast.success(`Invite sent to ${invite.email}`);
              setInvite({ email: "", role: "editor" });
              setInviteOpen(false);
            }}
          >
            Send invite
          </Button>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            Email
            <Input type="email" value={invite.email} onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value.trim() }))} placeholder="name@company.com" autoFocus />
          </label>
          {members.some((m) => m.email === invite.email) && <p className="text-sm text-destructive">That person is already a member.</p>}
          <div className="grid gap-1.5 text-sm">
            Role
            <Select aria-label="Role" value={invite.role} onValueChange={(role) => setInvite((i) => ({ ...i, role }))} options={Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label }))} />
          </div>
        </div>
      </Dialog>

      {selected && (
        <InspectorDrawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected.name} subtitle={selected.email}>
          <InspectorProperties
            values={{ role: selected.role, status: selected.status, mfa: selected.mfa }}
            fields={[
              { key: "role", label: "Role", type: "select", options: Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label })) },
              { key: "status", label: "Status", type: "select", options: ["Active", "Suspended"].map((v) => ({ value: v, label: v })) },
              { key: "mfa", label: "Two-factor sign-in", type: "switch" },
            ]}
            onSave={(v) => {
              const next = { ...selected, ...(v as Partial<Member>) };
              setMembers((all) => all.map((m) => (m.id === selected.id ? next : m)));
              setSelected(next);
              record("updated", selected.name);
              toast.success(`Saved ${selected.name}`);
            }}
          />
        </InspectorDrawer>
      )}
    </div>
  );
}
