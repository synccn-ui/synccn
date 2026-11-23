"use client";

import { useState } from "react";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { InspectorDrawer, InspectorProperties, InspectorSection, type InspectorValues } from "@/registry/ui/inspector-drawer";
import { toast } from "@/registry/ui/toast";
import { ToggleGroup } from "@/registry/ui/toggle-group";

const SERVICES: (InspectorValues & { id: string })[] = [
  { id: "svc_api", name: "api-gateway", region: "us-east-1", replicas: 4, autoscale: true, notes: "Public entry point. Rate limited per key.", status: "Healthy" },
  { id: "svc_jobs", name: "job-runner", region: "eu-west-1", replicas: 2, autoscale: false, notes: "", status: "Degraded" },
  { id: "svc_web", name: "web", region: "us-east-1", replicas: 6, autoscale: true, notes: "Next.js frontend.", status: "Healthy" },
];

export default function InspectorDrawerDemo() {
  const [services, setServices] = useState(SERVICES);
  const [selected, setSelected] = useState<string | null>(null);
  const [variant, setVariant] = useState("inline");
  const svc = services.find((s) => s.id === selected);
  const content = svc && (
    <InspectorProperties
      key={svc.id}
      values={svc}
      fields={[
        { key: "name", label: "Name", type: "text" },
        {
          key: "region",
          label: "Region",
          type: "select",
          options: ["us-east-1", "eu-west-1", "ap-south-1"].map((r) => ({ value: r, label: r })),
        },
        { key: "replicas", label: "Replicas", type: "number", hint: "Instances kept running at all times." },
        { key: "autoscale", label: "Autoscale", type: "switch" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      onSave={(v) => {
        setServices((all) => all.map((s) => (s.id === svc.id ? { ...s, ...v } : s)));
        toast.success(`Saved ${v.name}`);
      }}
    />
  );
  const tabs = svc && [
    { value: "settings", label: "Settings", content },
    {
      value: "details",
      label: "Details",
      content: (
        <div>
          <InspectorSection title="Status">
            <Badge variant={svc.status === "Healthy" ? "success" : "warning"} dot>
              {String(svc.status)}
            </Badge>
          </InspectorSection>
          <InspectorSection title="Identifiers" defaultOpen={false}>
            <p className="font-mono text-xs">{svc.id}</p>
          </InspectorSection>
        </div>
      ),
    },
  ];
  return (
    <div className="grid w-full gap-3">
      <ToggleGroup
        size="sm"
        value={variant}
        onValueChange={setVariant}
        options={[
          { value: "inline", label: "Inline panel" },
          { value: "modal", label: "Modal sheet" },
        ]}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <ul className="grid flex-1 gap-1.5 rounded-xl border p-2">
          {services.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={selected === s.id}
                onClick={() => setSelected(s.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-accent"
              >
                <span className="font-medium">{String(s.name)}</span>
                <span className="text-xs text-muted-foreground">
                  {String(s.region)} · {String(s.replicas)} replicas
                </span>
              </button>
            </li>
          ))}
        </ul>
        {svc && tabs && (
          <InspectorDrawer
            variant={variant === "inline" ? "inline" : "modal"}
            open={!!svc}
            onOpenChange={(o) => !o && setSelected(null)}
            title={String(svc.name)}
            subtitle={`${svc.id} · ${svc.region}`}
            tabs={tabs}
            actions={
              <Button variant="outline" size="sm" onClick={() => toast(`Restarting ${svc.name}`)}>
                Restart
              </Button>
            }
          />
        )}
        {!svc && <p className="self-center px-4 text-sm text-muted-foreground lg:w-96">Select a service to inspect it.</p>}
      </div>
    </div>
  );
}
