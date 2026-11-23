"use client";

import { Globe, Laptop, Smartphone } from "lucide-react";
import { Label } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";

export default function SelectDemo() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <div className="grid gap-2">
        <Label>Framework</Label>
        <Select
          aria-label="Framework"
          placeholder="Pick a framework"
          options={[
            { value: "vite", label: "Vite", group: "Client" },
            { value: "remix", label: "React Router", group: "Client" },
            { value: "next", label: "Next.js", group: "Full stack" },
            { value: "astro", label: "Astro", group: "Full stack" },
            { value: "gatsby", label: "Gatsby", group: "Full stack", disabled: true },
          ]}
        />
      </div>
      <div className="grid gap-2">
        <Label>Platform</Label>
        <Select
          aria-label="Platform"
          defaultValue="web"
          options={[
            { value: "web", label: "Web", icon: Globe },
            { value: "desktop", label: "Desktop", icon: Laptop },
            { value: "mobile", label: "Mobile", icon: Smartphone },
          ]}
        />
      </div>
    </div>
  );
}
