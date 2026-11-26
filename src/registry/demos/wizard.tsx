"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Input, Label } from "@/registry/ui/input";
import { RadioGroup } from "@/registry/ui/radio-group";
import { Switch } from "@/registry/ui/switch";
import { Wizard } from "@/registry/ui/wizard";

export default function WizardDemo() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("iad");
  const [previews, setPreviews] = useState(true);
  const [done, setDone] = useState(false);

  if (done)
    return (
      <div className="grid w-full max-w-md animate-fade justify-items-center gap-3 rounded-xl border bg-card p-8 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-success text-white">
          <Check className="size-5" />
        </span>
        <p className="font-semibold">{name} is ready</p>
        <p className="text-sm text-muted-foreground">Example only. Nothing was created.</p>
        <button type="button" className="text-sm underline underline-offset-4" onClick={() => (setDone(false), setName(""), setSlug(""))}>
          Start over
        </button>
      </div>
    );

  return (
    <Wizard
      className="max-w-md"
      finishLabel="Create project"
      onComplete={() => new Promise<void>((r) => setTimeout(() => (setDone(true), r()), 800))}
      steps={[
        {
          id: "name",
          title: "Name your project",
          description: "You can rename it later.",
          validate: () => (name.trim().length >= 2 ? true : "Give the project a name of at least two characters."),
          content: (
            <div className="grid gap-1.5">
              <Label htmlFor="wz-name">Project name</Label>
              <Input id="wz-name" value={name} onChange={(e) => (setName(e.target.value), setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")))} placeholder="Marketing site" autoFocus />
            </div>
          ),
        },
        {
          id: "url",
          title: "Choose a URL",
          // Pretend to check availability on a server.
          validate: () => new Promise((r) => setTimeout(() => r(slug === "admin" ? "That URL is taken. Try another." : slug ? true : "Pick a URL."), 600)),
          content: (
            <div className="grid gap-1.5">
              <Label htmlFor="wz-slug">URL</Label>
              <div className="flex items-center rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                <input id="wz-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
                <span className="pr-3 text-sm text-muted-foreground">.example.app</span>
              </div>
              <p className="text-xs text-muted-foreground">Try “admin” to see an async error.</p>
            </div>
          ),
        },
        {
          id: "settings",
          title: "Settings",
          content: (
            <>
              <RadioGroup
                value={region}
                onValueChange={setRegion}
                variant="cards"
                options={[
                  { value: "iad", label: "Washington, D.C.", description: "us-east" },
                  { value: "fra", label: "Frankfurt", description: "eu-central" },
                ]}
              />
              <Switch label="Preview deployments for pull requests" checked={previews} onCheckedChange={setPreviews} />
            </>
          ),
        },
      ]}
    />
  );
}
