"use client";

import { useMemo, useState } from "react";
import { Handshake, Mail, Phone, Plus, Target, Trophy } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { ActivityTimeline, type ActivityEvent } from "@/registry/ui/activity-timeline";
import { Avatar } from "@/registry/ui/avatar";
import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { DataView, type DataViewColumn } from "@/registry/ui/data-view";
import { FunnelChart } from "@/registry/ui/data-viz";
import { InspectorDrawer, InspectorProperties } from "@/registry/ui/inspector-drawer";
import { MentionInput, type MentionPerson } from "@/registry/ui/mention-input";
import { StatCard } from "@/registry/ui/stat-card";
import { toast } from "@/registry/ui/toast";
import { ToggleGroup } from "@/registry/ui/toggle-group";

type Stage = "lead" | "qualified" | "proposal" | "won" | "lost";
interface Deal {
  id: string;
  company: string;
  contact: string;
  email: string;
  stage: Stage;
  value: number;
  owner: string;
  closeIn: number;
  notes: { who: string; text: string; minutes: number }[];
}

const STAGES: Record<Stage, { label: string; tone: BadgeVariant }> = {
  lead: { label: "Lead", tone: "outline" },
  qualified: { label: "Qualified", tone: "secondary" },
  proposal: { label: "Proposal", tone: "soft" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "destructive" },
};
const OWNERS: MentionPerson[] = [
  { id: "synccn", name: "synccn", detail: "Sales" },
];
const COMPANIES = ["Northwind", "Globex", "Initech", "Umbrella Health", "Stark Freight", "Wayne Logistics", "Hooli", "Vandelay Imports", "Soylent Foods", "Cyberdyne", "Tyrell Labs", "Wonka Retail"];
const CONTACTS = ["synccn"];
const ORDER: Stage[] = ["proposal", "qualified", "lead", "won", "proposal", "qualified", "lead", "lost", "won", "qualified", "lead", "proposal"];

const DEALS: Deal[] = COMPANIES.map((company, i) => ({
  id: `deal_${i + 1}`,
  company,
  contact: CONTACTS[i % CONTACTS.length],
  email: "synccn@example.com",
  stage: ORDER[i],
  value: [24_000, 8_500, 4_000, 36_000, 52_000, 12_000, 6_500, 18_000, 9_800, 15_000, 3_200, 41_000][i],
  owner: OWNERS[0].name,
  closeIn: [6, 21, 45, -3, 12, 30, 60, -10, -20, 18, 50, 9][i],
  notes: i === 0 ? [{ who: "synccn", text: "Security review passed. Waiting on their legal team for the DPA.", minutes: 95 }] : [],
}));

const usd = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${n}`);

export default function CrmBlock() {
  const now = useNow();
  const [deals, setDeals] = useState(DEALS);
  const [view, setView] = useState("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const shown = deals.filter((d) => (view === "open" ? d.stage !== "won" && d.stage !== "lost" : view === "won" ? d.stage === "won" : true));
  const pipeline = deals.filter((d) => d.stage !== "won" && d.stage !== "lost").reduce((a, d) => a + d.value, 0);
  const won = deals.filter((d) => d.stage === "won").reduce((a, d) => a + d.value, 0);
  const closed = deals.filter((d) => d.stage === "won" || d.stage === "lost").length;
  const winRate = closed ? Math.round((deals.filter((d) => d.stage === "won").length / closed) * 100) : 0;
  const reached = (s: Stage[]) => deals.filter((d) => s.includes(d.stage)).length;
  const funnel = [
    { label: "Leads", value: deals.length },
    { label: "Qualified", value: reached(["qualified", "proposal", "won", "lost"]) },
    { label: "Proposal", value: reached(["proposal", "won", "lost"]) },
    { label: "Won", value: reached(["won"]) },
  ];

  const deal = deals.find((d) => d.id === openId) ?? null;
  const update = (id: string, patch: Partial<Deal>) => setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const events = useMemo<ActivityEvent[]>(() => {
    if (!deal) return [];
    const t = now ? now.getTime() : Date.UTC(2026, 10, 26, 12);
    return [
      ...deal.notes.map((n, i) => ({ id: `n${i}`, actor: { name: n.who }, action: "added a note", time: t - n.minutes * 60_000, type: "note", details: n.text })),
      { id: "e1", actor: { name: deal.owner }, action: "emailed", target: deal.contact, time: t - 60 * 60_000 * 26, type: "email", icon: Mail },
      { id: "e2", actor: { name: deal.owner }, action: "had a call with", target: deal.contact, time: t - 60 * 60_000 * 52, type: "call", icon: Phone, status: "success" as const, details: "30 min discovery call. Budget confirmed for Q1." },
      { id: "e3", actor: { name: "synccn" }, action: "created the deal", time: t - 60 * 60_000 * 24 * 9, type: "deal", icon: Handshake },
    ];
  }, [deal, now]);

  const closeLabel = (d: Deal) => (d.stage === "won" || d.stage === "lost" ? "Closed" : d.closeIn < 0 ? `${-d.closeIn}d overdue` : `in ${d.closeIn}d`);

  const columns: DataViewColumn<Deal>[] = [
    {
      key: "company",
      header: "Company",
      sortable: true,
      hideable: false,
      width: 220,
      cell: (d) => (
        <span className="grid min-w-0">
          <span className="truncate font-medium">{d.company}</span>
          <span className="truncate text-xs text-muted-foreground">{d.contact}</span>
        </span>
      ),
    },
    { key: "stage", header: "Stage", sortable: true, width: 120, value: (d) => Object.keys(STAGES).indexOf(d.stage), cell: (d) => <Badge variant={STAGES[d.stage].tone}>{STAGES[d.stage].label}</Badge> },
    { key: "value", header: "Value", sortable: true, align: "right", width: 100, cell: (d) => <span className="tabular-nums">{usd(d.value)}</span> },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      width: 130,
      cell: (d) => (
        <span className="flex items-center gap-2">
          <Avatar name={d.owner} size="xs" /> {d.owner}
        </span>
      ),
    },
    { key: "closeIn", header: "Close", sortable: true, align: "right", width: 110, cell: (d) => <span className={d.closeIn < 0 && d.stage !== "won" && d.stage !== "lost" ? "text-destructive" : "text-muted-foreground"}>{closeLabel(d)}</span> },
  ];

  const addNote = (text: string, mentioned: MentionPerson[]) => {
    if (!deal || !text.trim()) return;
    update(deal.id, { notes: [{ who: "synccn", text: text.trim(), minutes: 0 }, ...deal.notes] });
    setNote("");
    toast.success("Note added", { description: mentioned.length ? `Notified ${mentioned.map((p) => p.name).join(", ")}` : undefined });
  };

  return (
    <div className="grid w-full max-w-6xl gap-5 rounded-2xl border bg-background p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Pipeline</h2>
          <p className="text-sm text-muted-foreground">{shown.length} deals · click one to see its history</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const id = `deal_${Date.now()}`;
            setDeals((ds) => [{ id, company: "New company", contact: "New contact", email: "new@example.com", stage: "lead", value: 5_000, owner: "synccn", closeIn: 30, notes: [] }, ...ds]);
            setView("open");
            setOpenId(id);
          }}
        >
          <Plus /> New deal
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Open pipeline" value={usd(pipeline)} change={8.2} icon={Target} trend={[18, 20, 19, 24, 27, 26, 31]} />
        <StatCard label="Won this quarter" value={usd(won)} change={14.5} icon={Trophy} trend={[4, 6, 8, 8, 11, 13, 15]} />
        <StatCard label="Win rate" value={`${winRate}%`} change={-3.1} changeLabel="vs last quarter" icon={Handshake} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <DataView
          columns={columns}
          data={shown}
          rowKey={(d) => d.id}
          onRowClick={(d) => setOpenId(d.id)}
          label="Deals"
          searchPlaceholder="Search deals…"
          toolbar={
            <ToggleGroup
              size="sm"
              value={view}
              onValueChange={setView}
              options={[
                { value: "open", label: "Open" },
                { value: "won", label: "Won" },
                { value: "all", label: "All" },
              ]}
            />
          }
        />
        <section className="grid content-start gap-3 rounded-xl border bg-card p-4" aria-labelledby="crm-funnel">
          <h3 id="crm-funnel" className="text-sm font-semibold">
            Conversion
          </h3>
          <FunnelChart data={funnel} />
        </section>
      </div>

      {deal && (
        <InspectorDrawer
          open={!!deal}
          onOpenChange={(o) => !o && setOpenId(null)}
          title={deal.company}
          subtitle={`${deal.contact} · ${deal.email}`}
          tabs={[
            {
              value: "overview",
              label: "Overview",
              content: (
                <InspectorProperties
                  values={{ company: deal.company, contact: deal.contact, stage: deal.stage, value: deal.value, owner: deal.owner }}
                  fields={[
                    { key: "company", label: "Company", type: "text" },
                    { key: "contact", label: "Contact", type: "text" },
                    { key: "stage", label: "Stage", type: "select", options: (Object.keys(STAGES) as Stage[]).map((s) => ({ value: s, label: STAGES[s].label })) },
                    { key: "value", label: "Value (USD)", type: "number" },
                    { key: "owner", label: "Owner", type: "select", options: OWNERS.map((o) => ({ value: o.name, label: o.name })) },
                  ]}
                  onSave={(v) => {
                    update(deal.id, v as Partial<Deal>);
                    toast.success(`Saved ${String(v.company ?? deal.company)}`);
                  }}
                />
              ),
            },
            { value: "activity", label: "Activity", content: <ActivityTimeline events={events} types={{ note: "Notes", email: "Emails", call: "Calls" }} /> },
            {
              value: "notes",
              label: `Notes${deal.notes.length ? ` (${deal.notes.length})` : ""}`,
              content: (
                <div className="grid gap-4">
                  <MentionInput people={OWNERS} value={note} onValueChange={setNote} onSubmit={addNote} aria-label="Note" placeholder="Add a note, @ to loop someone in" rows={3} />
                  <Button size="sm" className="w-fit" disabled={!note.trim()} onClick={() => addNote(note, [])}>
                    Add note
                  </Button>
                  <ul className="grid gap-3">
                    {deal.notes.map((n, i) => (
                      <li key={i} className="grid gap-1 rounded-lg border bg-card p-3">
                        <p className="flex items-center gap-2 text-xs font-medium">
                          <Avatar name={n.who} size="xs" /> {n.who}
                        </p>
                        <p className="text-sm leading-relaxed">{n.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
