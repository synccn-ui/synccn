"use client";

import { useMemo, useState } from "react";
import { Activity, Eye, EyeOff, Gauge, KeyRound, Plus, RotateCcw, Trash2, Undo2, Zap } from "lucide-react";
import { AsyncState, useAsync } from "@/registry/ui/async-state";
import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { CopyButton } from "@/registry/ui/copy-button";
import { DataView, type DataViewColumn } from "@/registry/ui/data-view";
import { Tracker } from "@/registry/ui/data-viz";
import { Dialog } from "@/registry/ui/dialog";
import { Input } from "@/registry/ui/input";
import { InspectorDrawer, InspectorSection } from "@/registry/ui/inspector-drawer";
import { Select } from "@/registry/ui/select";
import { StatCard } from "@/registry/ui/stat-card";
import { StatusIndicator } from "@/registry/ui/status-indicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";
import { toast } from "@/registry/ui/toast";
import { ToggleGroup } from "@/registry/ui/toggle-group";

interface Deployment {
  id: string;
  branch: string;
  commit: string;
  message: string;
  author: string;
  status: "Ready" | "Building" | "Failed" | "Rolled back";
  env: "Production" | "Preview";
  minutesAgo: number;
  duration: string;
}

const DEPLOYMENTS: Deployment[] = [
  { id: "dpl_9f2a", branch: "main", commit: "a41c9e2", message: "Add saved views to DataView", author: "Michael", status: "Ready", env: "Production", minutesAgo: 6, duration: "41s" },
  { id: "dpl_9f19", branch: "feat/billing-retries", commit: "7be0d13", message: "Cap webhook retries at three", author: "Riley", status: "Building", env: "Preview", minutesAgo: 2, duration: "…" },
  { id: "dpl_9e77", branch: "main", commit: "e02f6aa", message: "Upgrade to Node 24", author: "Jayden", status: "Failed", env: "Production", minutesAgo: 95, duration: "1m 12s" },
  { id: "dpl_9e40", branch: "fix/eu-latency", commit: "c93b712", message: "Pin eu-west-1 read replica", author: "Riley", status: "Ready", env: "Preview", minutesAgo: 240, duration: "38s" },
  { id: "dpl_9d02", branch: "main", commit: "55d01fe", message: "Release 5.2", author: "Michael", status: "Rolled back", env: "Production", minutesAgo: 1560, duration: "44s" },
];

/*
 * The block's data layer. Replace these with calls to your platform API; the UI only
 * depends on the shapes they return.
 */
const api = {
  loadDeployments: (signal: AbortSignal) =>
    new Promise<Deployment[]>((resolve, reject) => {
      const t = setTimeout(() => resolve(DEPLOYMENTS), 600);
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }),
};

const STATUS: Record<Deployment["status"], BadgeVariant> = { Ready: "success", Building: "warning", Failed: "destructive", "Rolled back": "secondary" };
const ago = (m: number) => (m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`);

const LOGS = [
  { t: "12:04:11", level: "info", msg: "GET /v1/projects 200 in 38ms" },
  { t: "12:04:12", level: "info", msg: "POST /v1/deployments 201 in 412ms" },
  { t: "12:04:15", level: "warn", msg: "Rate limit at 80% for key sk_live_…4f2a" },
  { t: "12:04:19", level: "error", msg: "Webhook delivery failed: https://hooks.example.com returned 502" },
  { t: "12:04:20", level: "info", msg: "Retrying webhook in 30s (attempt 2 of 3)" },
  { t: "12:04:31", level: "info", msg: "GET /v1/usage 200 in 21ms" },
  { t: "12:04:50", level: "error", msg: "Build dpl_9e77 failed: node-gyp needs Python 3.12" },
  { t: "12:04:52", level: "info", msg: "GET /v1/projects/web 200 in 29ms" },
] as const;
const LEVEL = { info: "text-muted-foreground", warn: "text-warning", error: "text-destructive" };

interface Key {
  id: string;
  name: string;
  last4: string;
  created: string;
  scope: string;
}

function Keys() {
  const [keys, setKeys] = useState<Key[]>([
    { id: "k1", name: "Production server", last4: "4f2a", created: "Oct 2", scope: "Full access" },
    { id: "k2", name: "CI", last4: "91c0", created: "Nov 14", scope: "Deployments" },
  ]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("Read only");
  const [created, setCreated] = useState<string | null>(null);
  const create = () => {
    // Generated in the browser for the demo; a real API returns the secret once.
    const secret = `sk_live_${Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("")}`;
    setKeys((k) => [...k, { id: secret, name: name.trim(), last4: secret.slice(-4), created: "Just now", scope }]);
    setCreated(secret);
  };
  const revoke = (k: Key) => {
    setKeys((all) => all.filter((x) => x.id !== k.id));
    toast(`Revoked ${k.name}`, { action: { label: "Undo", onClick: () => setKeys((all) => [...all, k]) } });
  };
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Keys can call the API as this project. Treat them like passwords.</p>
        <Button size="sm" onClick={() => (setOpen(true), setCreated(null), setName(""))}>
          <Plus /> Create key
        </Button>
      </div>
      <ul className="divide-y rounded-xl border">
        {keys.map((k) => (
          <li key={k.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
            <KeyRound className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{k.name}</span>
              <span className="font-mono text-xs text-muted-foreground">sk_live_••••{k.last4}</span>
            </span>
            <Badge variant="outline">{k.scope}</Badge>
            <span className="w-20 text-xs text-muted-foreground">{k.created}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Revoke ${k.name}`} onClick={() => revoke(k)}>
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={created ? "Copy your key now" : "Create API key"}
        description={created ? "You won't be able to see it again." : "Name it after where it will be used."}
        footer={
          created ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <Button onClick={create} disabled={!name.trim()}>
              Create key
            </Button>
          )
        }
      >
        {created ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{created}</code>
            <CopyButton value={created} />
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-sm">
              Name
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Staging worker" autoFocus />
            </label>
            <div className="grid gap-1.5 text-sm">
              Access
              <Select aria-label="Access" value={scope} onValueChange={setScope} options={["Read only", "Deployments", "Full access"].map((v) => ({ value: v, label: v }))} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Env() {
  const [env, setEnv] = useState("Production");
  const [shown, setShown] = useState<Set<string>>(() => new Set());
  const [vars, setVars] = useState([
    { key: "DATABASE_URL", value: "postgres://app:s3cr3t@db.internal:5432/app" },
    { key: "STRIPE_SECRET_KEY", value: "sk_live_51Hc…" },
    { key: "NEXT_PUBLIC_SITE_URL", value: "https://example.com" },
  ]);
  const [draft, setDraft] = useState({ key: "", value: "" });
  const valid = /^[A-Z][A-Z0-9_]*$/.test(draft.key) && draft.value !== "" && !vars.some((v) => v.key === draft.key);
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Changes apply on the next deploy.</p>
        <Select aria-label="Environment" value={env} onValueChange={setEnv} options={["Production", "Preview", "Development"].map((v) => ({ value: v, label: v }))} className="w-40" />
      </div>
      <ul className="divide-y rounded-xl border">
        {vars.map((v) => (
          <li key={v.key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-48 shrink-0 truncate font-mono text-xs font-medium">{v.key}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{shown.has(v.key) ? v.value : "•".repeat(18)}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${shown.has(v.key) ? "Hide" : "Show"} ${v.key}`}
              onClick={() =>
                setShown((s) => {
                  const n = new Set(s);
                  n.has(v.key) ? n.delete(v.key) : n.add(v.key);
                  return n;
                })
              }
            >
              {shown.has(v.key) ? <EyeOff /> : <Eye />}
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          setVars((all) => [...all, draft]);
          setDraft({ key: "", value: "" });
          toast.success(`Added ${draft.key} to ${env}`);
        }}
      >
        <Input aria-label="Name" placeholder="NAME" value={draft.key} onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value.toUpperCase() }))} className="h-9 w-48 font-mono text-xs" />
        <Input aria-label="Value" placeholder="Value" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} className="h-9 min-w-40 flex-1 font-mono text-xs" />
        <Button type="submit" size="sm" variant="outline" disabled={!valid} className="h-9">
          Add
        </Button>
      </form>
    </div>
  );
}

function Logs() {
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");
  const rows = LOGS.filter((l) => (level === "all" || l.level === level) && l.msg.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          size="sm"
          value={level}
          onValueChange={setLevel}
          options={[
            { value: "all", label: "All" },
            { value: "info", label: "Info" },
            { value: "warn", label: "Warnings" },
            { value: "error", label: "Errors" },
          ]}
        />
        <Input aria-label="Search logs" placeholder="Search logs…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56" />
      </div>
      <ol aria-label="Log lines" className="max-h-64 overflow-y-auto rounded-xl border bg-muted/30 p-3 font-mono text-xs leading-6 scrollbar-thin">
        {rows.length === 0 && <li className="text-muted-foreground">No lines match.</li>}
        {rows.map((l) => (
          <li key={l.t + l.msg} className="flex gap-3">
            <span className="text-muted-foreground">{l.t}</span>
            <span className={`w-10 shrink-0 uppercase ${LEVEL[l.level]}`}>{l.level}</span>
            <span className="min-w-0 break-words">{l.msg}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function DeveloperPlatformBlock() {
  const deployments = useAsync((signal) => api.loadDeployments(signal), []);
  const [selected, setSelected] = useState<Deployment | null>(null);
  const uptime = useMemo(() => Array.from({ length: 45 }, (_, i) => ({ status: (i === 31 ? "down" : i === 12 || i === 40 ? "warn" : "ok") as "ok" | "warn" | "down", tooltip: `${45 - i} days ago: ${i === 31 ? "Outage (18 min)" : i === 12 || i === 40 ? "Degraded" : "Operational"}` })), []);
  const columns: DataViewColumn<Deployment>[] = [
    {
      key: "message",
      header: "Deployment",
      hideable: false,
      width: 300,
      cell: (d) => (
        <span className="grid">
          <span className="truncate font-medium">{d.message}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {d.branch} · {d.commit}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: 130,
      cell: (d) => (
        <Badge variant={STATUS[d.status]} dot>
          {d.status}
        </Badge>
      ),
    },
    { key: "env", header: "Environment", sortable: true, width: 130 },
    { key: "author", header: "By", sortable: true, width: 100 },
    { key: "minutesAgo", header: "Created", sortable: true, align: "right", width: 100, cell: (d) => ago(d.minutesAgo) },
  ];

  return (
    <div className="grid w-full max-w-6xl gap-5 rounded-2xl border bg-background p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold tracking-tight">acme/web</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <StatusIndicator status="online" label="API" />
            <StatusIndicator status="away" label="Webhooks degraded" />
            <StatusIndicator status="online" label="Builds" />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast("Redeploying main")}>
          <Zap /> Redeploy main
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Requests (24h)" value="1.28M" change={6.2} changeLabel="vs yesterday" trend={[31, 34, 33, 38, 41, 39, 44]} icon={Activity} />
        <StatCard label="Error rate" value="0.42%" change={-0.11} changeLabel="vs yesterday" goodWhen="down" icon={Gauge} />
        <StatCard label="p95 latency" value="182 ms" change={-4.8} changeLabel="vs yesterday" goodWhen="down" icon={Zap} />
      </div>

      <section aria-label="Uptime" className="grid gap-2 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Uptime, last 45 days</span>
          <span className="tabular-nums text-muted-foreground">99.97%</span>
        </div>
        <Tracker data={uptime} />
      </section>

      <Tabs defaultValue="deployments" variant="underline">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="keys">API keys</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="env">Environment</TabsTrigger>
        </TabsList>
        <TabsContent value="deployments" className="pt-4">
          <AsyncState {...deployments} onRetry={deployments.retry} label="deployments" loading={<DataView columns={columns} data={[]} rowKey={(d) => d.id} loading label="Deployments" />}>
            {(rows) => <DataView columns={columns} data={rows} rowKey={(d) => d.id} onRowClick={setSelected} label="Deployments" searchPlaceholder="Search deployments…" />}
          </AsyncState>
        </TabsContent>
        <TabsContent value="keys" className="pt-4">
          <Keys />
        </TabsContent>
        <TabsContent value="logs" className="pt-4">
          <Logs />
        </TabsContent>
        <TabsContent value="env" className="pt-4">
          <Env />
        </TabsContent>
      </Tabs>

      {selected && (
        <InspectorDrawer
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected.message}
          subtitle={
            <span className="flex items-center gap-2">
              <Badge variant={STATUS[selected.status]} dot>
                {selected.status}
              </Badge>
              <span className="font-mono text-xs">{selected.id}</span>
            </span>
          }
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => (toast(`Rolling back to ${selected.commit}`), setSelected(null))}>
                <Undo2 /> Roll back
              </Button>
              <Button size="sm" onClick={() => (toast.success(`Redeploying ${selected.commit}`), setSelected(null))}>
                <RotateCcw /> Redeploy
              </Button>
            </>
          }
        >
          <InspectorSection title="Source">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Branch</dt>
              <dd className="font-mono text-xs">{selected.branch}</dd>
              <dt className="text-muted-foreground">Commit</dt>
              <dd className="font-mono text-xs">{selected.commit}</dd>
              <dt className="text-muted-foreground">Author</dt>
              <dd>{selected.author}</dd>
              <dt className="text-muted-foreground">Build time</dt>
              <dd>{selected.duration}</dd>
            </dl>
          </InspectorSection>
          <InspectorSection title="Build log" defaultOpen={selected.status === "Failed"}>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
              {`$ npm ci\nadded 412 packages in 9s\n$ npm run build\n${selected.status === "Failed" ? "gyp ERR! find Python 3.12\nError: build exited with code 1" : "✓ Compiled in 18.2s\n✓ Uploaded 86 files"}`}
            </pre>
          </InspectorSection>
        </InspectorDrawer>
      )}
    </div>
  );
}
