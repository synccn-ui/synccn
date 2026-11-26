"use client";

import { useState } from "react";
import { BarChart3, Bell, DollarSign, FolderKanban, Home, Inbox, Settings, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/registry/ui/avatar";
import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { AreaChart } from "@/registry/ui/charts";
import { StatCard } from "@/registry/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/ui/table";
import { ToggleGroup } from "@/registry/ui/toggle-group";

const nav = [
  { label: "Overview", icon: Home },
  { label: "Analytics", icon: BarChart3 },
  { label: "Orders", icon: ShoppingCart, count: 12 },
  { label: "Customers", icon: Users },
  { label: "Projects", icon: FolderKanban },
  { label: "Inbox", icon: Inbox, count: 3 },
];

const series = {
  "7d": [32, 41, 38, 52, 47, 61, 58].map((v, i) => ({ label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], value: v * 100 })),
  "30d": Array.from({ length: 30 }, (_, i) => ({ label: `Day ${i + 1}`, value: Math.round(3000 + Math.sin(i / 3) * 800 + i * 90) })),
};

const orders = [
  { id: "#3201", who: "synccn", status: "Paid", total: "$320.00" },
  { id: "#3200", who: "synccn", status: "Pending", total: "$89.50" },
  { id: "#3199", who: "synccn", status: "Paid", total: "$1,140.00" },
  { id: "#3198", who: "synccn", status: "Refunded", total: "$42.00" },
];
const tone: Record<string, BadgeVariant> = { Paid: "success", Pending: "warning", Refunded: "secondary" };

export default function DashboardBlock() {
  const [active, setActive] = useState("Overview");
  const [range, setRange] = useState("7d");
  return (
    <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl border bg-background text-left">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3 md:flex">
        <p className="px-2 pb-3 pt-1 text-sm font-semibold">Dashboard</p>
        {nav.map((n) => (
          <button
            key={n.label}
            type="button"
            onClick={() => setActive(n.label)}
            className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors", active === n.label ? "bg-background font-medium shadow-xs" : "text-muted-foreground hover:bg-background/60 hover:text-foreground")}
          >
            <n.icon className="size-4" />
            <span className="flex-1 text-left">{n.label}</span>
            {n.count && <span className="rounded-full bg-primary px-1.5 text-[11px] font-medium leading-5 text-primary-foreground">{n.count}</span>}
          </button>
        ))}
        <button type="button" className="mt-auto flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-background/60">
          <Settings className="size-4" /> Settings
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex h-14 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <p className="font-semibold">{active}</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notifications" className="relative grid size-8 place-items-center rounded-md hover:bg-accent">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </button>
            <Avatar name="synccn" size="sm" />
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Revenue" value="$48,290" change={12.4} icon={DollarSign} />
            <StatCard label="Orders" value="1,204" change={4.1} icon={ShoppingCart} />
            <StatCard label="Refund rate" value="1.8%" change={-0.4} icon={Users} />
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Sales</p>
                <p className="text-[13px] text-muted-foreground">{range === "7d" ? "Last 7 days" : "Last 30 days"}</p>
              </div>
              <ToggleGroup size="sm" value={range} onValueChange={setRange} options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} />
            </div>
            <AreaChart key={range} data={series[range as keyof typeof series]} height={180} format={(v) => `$${v.toLocaleString()}`} />
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <p className="px-4 pb-1 pt-4 text-sm font-semibold">Recent orders</p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.who}</TableCell>
                    <TableCell>
                      <Badge variant={tone[o.status]} dot>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{o.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
