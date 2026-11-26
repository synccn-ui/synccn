"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Download } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { DataView, type DataViewColumn, type DataViewState } from "@/registry/ui/data-view";
import { Switch } from "@/registry/ui/switch";
import { toast } from "@/registry/ui/toast";
import { ToggleGroup } from "@/registry/ui/toggle-group";

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Past due" | "Cancelled";
  mrr: number;
  joined: string;
}

const PLANS = ["Free", "Pro", "Pro", "Enterprise"] as const;
const STATUSES = ["Active", "Active", "Active", "Past due", "Cancelled"] as const;

// Deterministic sample data, so server and browser render the same rows.
const CUSTOMERS: Customer[] = Array.from({ length: 64 }, (_, i) => {
  const name = "synccn";
  const plan = PLANS[(i * 7) % PLANS.length];
  return {
    id: `cus_${(1000 + i * 37).toString(36)}`,
    name,
    email: "synccn@example.com",
    plan,
    status: STATUSES[(i * 5) % STATUSES.length],
    mrr: plan === "Free" ? 0 : plan === "Pro" ? 29 * (1 + (i % 4)) : 480 + (i % 6) * 120,
    joined: `2026-${String(1 + (i % 10)).padStart(2, "0")}-${String(1 + ((i * 11) % 28)).padStart(2, "0")}`,
  };
});

const columns: DataViewColumn<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    sortable: true,
    hideable: false,
    width: 220,
    cell: (c) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={c.name} size="xs" />
        <span className="truncate font-medium">{c.name}</span>
      </span>
    ),
  },
  { key: "email", header: "Email", width: 240, cell: (c) => <span className="text-muted-foreground">{c.email}</span> },
  { key: "plan", header: "Plan", sortable: true, width: 120, cell: (c) => <Badge variant={c.plan === "Enterprise" ? "default" : "secondary"}>{c.plan}</Badge> },
  {
    key: "status",
    header: "Status",
    sortable: true,
    width: 130,
    cell: (c) => (
      <Badge variant={c.status === "Active" ? "success" : c.status === "Past due" ? "warning" : "outline"} dot>
        {c.status}
      </Badge>
    ),
  },
  { key: "mrr", header: "MRR", sortable: true, align: "right", width: 100, cell: (c) => `$${c.mrr.toLocaleString("en-US")}` },
  { key: "joined", header: "Joined", sortable: true, hidden: true, width: 120 },
];

/** Pretend server: sorts, searches and pages, with latency and an optional failure. */
function fetchCustomers(s: DataViewState, fail: boolean): Promise<{ rows: Customer[]; total: number }> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (fail) return reject(new Error("The server returned 503. It may be restarting."));
      const q = s.search.toLowerCase();
      let rows = CUSTOMERS.filter((c) => !q || `${c.name} ${c.email} ${c.plan} ${c.status}`.toLowerCase().includes(q));
      if (s.sort) {
        const { key, direction } = s.sort;
        rows = [...rows].sort((a, b) => String(a[key as keyof Customer]).localeCompare(String(b[key as keyof Customer]), undefined, { numeric: true }) * (direction === "asc" ? 1 : -1));
      }
      resolve({ rows: rows.slice((s.page - 1) * s.pageSize, s.page * s.pageSize), total: rows.length });
    }, 700)
  );
}

function ServerExample() {
  const [state, setState] = useState<DataViewState>({ search: "", sort: null, page: 1, pageSize: 10, hidden: [] });
  const [fail, setFail] = useState(false);
  const [result, setResult] = useState<{ rows: Customer[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    let live = true;
    fetchCustomers(state, fail).then(
      (r) => live && (setResult(r), setLoading(false)),
      (e: Error) => live && (setError(e.message), setLoading(false))
    );
    return () => {
      live = false;
    };
  }, [state, fail]);
  useEffect(load, [load]);
  return (
    <DataView
      mode="server"
      columns={columns}
      data={result.rows}
      rowCount={result.total}
      rowKey={(c) => c.id}
      onStateChange={setState}
      loading={loading}
      error={error}
      onRetry={load}
      label="Customers"
      toolbar={<Switch size="sm" checked={fail} onCheckedChange={setFail} label="Simulate an outage" />}
    />
  );
}

export default function DataViewDemo() {
  const [source, setSource] = useState("local");
  return (
    <div className="grid w-full gap-4">
      <ToggleGroup
        size="sm"
        value={source}
        onValueChange={setSource}
        options={[
          { value: "local", label: "Local data" },
          { value: "server", label: "Server (simulated)" },
        ]}
      />
      {source === "local" ? (
        <DataView
          columns={columns}
          data={CUSTOMERS}
          rowKey={(c) => c.id}
          selectable
          storageKey="synccn-demo-customer-views"
          views={[
            { name: "Enterprise", state: { search: "Enterprise", sort: { key: "mrr", direction: "desc" }, hidden: [], pageSize: 10 } },
            { name: "Past due", state: { search: "Past due", sort: null, hidden: ["email"], pageSize: 10 } },
          ]}
          label="Customers"
          bulkActions={(rows, clear) => (
            <>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Exported ${rows.length} customers`)}>
                <Download /> Export
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast(`Archived ${rows.length} customers`);
                  clear();
                }}
              >
                <Archive /> Archive
              </Button>
            </>
          )}
        />
      ) : (
        <ServerExample />
      )}
    </div>
  );
}
