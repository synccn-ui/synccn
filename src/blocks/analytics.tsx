"use client";

import { useMemo, useState } from "react";
import { BarChart3, DollarSign, Gauge, Globe, Home, MousePointerClick, Settings, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DonutChart, LineChart } from "@/registry/ui/charts";
import { BarList } from "@/registry/ui/data-viz";
import { DataView, type DataViewColumn } from "@/registry/ui/data-view";
import { StatCard } from "@/registry/ui/stat-card";
import { Switch } from "@/registry/ui/switch";
import { ToggleGroup } from "@/registry/ui/toggle-group";

/*
 * Sample data. Swap `loadAnalytics` for a request to your analytics API: it returns
 * daily totals for the selected range and the period before it.
 */
const DAYS = 180;
const daily = Array.from({ length: DAYS }, (_, i) => {
  const visitors = Math.round(2400 + i * 9 + Math.sin(i / 3.2) * 380 + Math.cos(i / 9) * 220 + ((i * 37) % 11) * 18);
  const signups = Math.round(visitors * (0.031 + Math.sin(i / 14) * 0.004));
  return { visitors, signups, revenue: signups * (42 + (i % 7) * 3) };
});

type Range = "7" | "30" | "90";
function loadAnalytics(range: Range) {
  const n = Number(range);
  return { current: daily.slice(DAYS - n), previous: daily.slice(DAYS - 2 * n, DAYS - n) };
}

const sum = (rows: typeof daily, k: keyof (typeof daily)[number]) => rows.reduce((a, r) => a + r[k], 0);
const change = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
const money = (v: number) => `$${v.toLocaleString("en-US")}`;

interface PageRow {
  path: string;
  views: number;
  time: number;
  bounce: number;
}
const PAGES: PageRow[] = ["/", "/pricing", "/docs/installation", "/components/data-view", "/blog/theme-studio", "/changelog", "/signup", "/docs/cli"].map((path, i) => ({
  path,
  views: Math.round(18400 / (i + 1.2)),
  time: 38 + ((i * 23) % 140),
  bounce: 24 + ((i * 17) % 41),
}));
const pageColumns: DataViewColumn<PageRow>[] = [
  { key: "path", header: "Page", sortable: true, hideable: false, cell: (r) => <span className="font-mono text-xs">{r.path}</span> },
  { key: "views", header: "Views", sortable: true, align: "right", width: 100, cell: (r) => r.views.toLocaleString("en-US") },
  { key: "time", header: "Avg. time", sortable: true, align: "right", width: 110, cell: (r) => `${Math.floor(r.time / 60)}m ${r.time % 60}s` },
  { key: "bounce", header: "Bounce", sortable: true, align: "right", width: 100, cell: (r) => `${r.bounce}%` },
];

const nav = [
  { label: "Overview", icon: Home },
  { label: "Analytics", icon: BarChart3 },
  { label: "Audience", icon: Users },
  { label: "Acquisition", icon: Globe },
  { label: "Settings", icon: Settings },
];

export default function AnalyticsBlock() {
  const [range, setRange] = useState<Range>("30");
  const [compare, setCompare] = useState(true);
  const [active, setActive] = useState("Analytics");
  const { current, previous } = useMemo(() => loadAnalytics(range), [range]);

  const visitors = sum(current, "visitors");
  const signups = sum(current, "signups");
  const revenue = sum(current, "revenue");
  const conv = Math.round((signups / visitors) * 1000) / 10;
  const prevConv = Math.round((sum(previous, "signups") / sum(previous, "visitors")) * 1000) / 10;
  const step = range === "7" ? 1 : range === "30" ? 3 : 7;
  const bucket = (rows: typeof daily) => rows.filter((_, i) => i % step === 0).map((_, j) => rows.slice(j * step, j * step + step).reduce((a, r) => a + r.visitors, 0));
  const labels = current.filter((_, i) => i % step === 0).map((_, j) => (range === "7" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][j] : `${range === "30" ? "D" : "W"}${j + 1}`));

  return (
    <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl border bg-background text-left">
      <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3 md:flex">
        <p className="px-2.5 pb-3 pt-1 text-sm font-semibold">Analytics</p>
        <nav aria-label="Analytics" className="grid gap-0.5">
          {nav.map((n) => (
            <button
              key={n.label}
              type="button"
              aria-current={active === n.label ? "page" : undefined}
              onClick={() => setActive(n.label)}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring", active === n.label && "bg-accent font-medium text-foreground")}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="grid min-w-0 flex-1 content-start gap-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Traffic and conversion</h2>
            <p className="text-sm text-muted-foreground">Last {range} days{compare ? `, compared with the ${range} days before` : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Switch size="sm" checked={compare} onCheckedChange={setCompare} label="Compare" />
            <ToggleGroup
              size="sm"
              value={range}
              onValueChange={(v) => setRange(v as Range)}
              options={[
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]}
            />
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Visitors" value={visitors.toLocaleString("en-US")} changeLabel={`vs previous ${range} days`} change={compare ? change(visitors, sum(previous, "visitors")) : undefined} icon={MousePointerClick} />
          <StatCard label="Signups" value={signups.toLocaleString("en-US")} changeLabel={`vs previous ${range} days`} change={compare ? change(signups, sum(previous, "signups")) : undefined} icon={UserPlus} />
          <StatCard label="Conversion" value={`${conv}%`} changeLabel={`vs previous ${range} days`} change={compare ? Math.round((conv - prevConv) * 10) / 10 : undefined} icon={Gauge} />
          <StatCard label="Revenue" value={money(revenue)} changeLabel={`vs previous ${range} days`} change={compare ? change(revenue, sum(previous, "revenue")) : undefined} icon={DollarSign} />
        </div>

        <section aria-label="Visitors over time" className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Visitors</h3>
            <span className="text-xs text-muted-foreground">{step === 1 ? "Daily" : step === 3 ? "Every 3 days" : "Weekly"}</span>
          </div>
          <LineChart
            labels={labels}
            series={[{ name: "This period", values: bucket(current) }, ...(compare ? [{ name: "Previous period", values: bucket(previous) }] : [])]}
            height={220}
            format={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
          />
        </section>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section aria-label="Channels" className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">Top channels</h3>
            <BarList
              data={[
                { name: "Organic search", value: Math.round(visitors * 0.41) },
                { name: "Direct", value: Math.round(visitors * 0.24) },
                { name: "GitHub", value: Math.round(visitors * 0.17) },
                { name: "Newsletter", value: Math.round(visitors * 0.11) },
                { name: "Social", value: Math.round(visitors * 0.07) },
              ]}
              format={(v) => v.toLocaleString("en-US")}
            />
          </section>
          <section aria-label="Devices" className="grid justify-items-center rounded-xl border bg-card p-4">
            <h3 className="mb-3 justify-self-start text-sm font-medium">Devices</h3>
            <DonutChart
              size={170}
              centerLabel="visitors"
              data={[
                { label: "Desktop", value: Math.round(visitors * 0.58) },
                { label: "Mobile", value: Math.round(visitors * 0.36) },
                { label: "Tablet", value: Math.round(visitors * 0.06) },
              ]}
              format={(v) => v.toLocaleString("en-US")}
            />
          </section>
        </div>

        <section aria-label="Top pages" className="grid gap-3">
          <h3 className="text-sm font-medium">Top pages</h3>
          <DataView columns={pageColumns} data={PAGES} rowKey={(r) => r.path} pageSizes={[5, 10]} label="Top pages" searchPlaceholder="Filter pages…" />
        </section>
      </main>
    </div>
  );
}
