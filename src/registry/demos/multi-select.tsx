"use client";

import { Label } from "@/registry/ui/input";
import { MultiSelect } from "@/registry/ui/multi-select";

const skills = ["React", "TypeScript", "Tailwind CSS", "Node.js", "Next.js", "GraphQL", "Figma", "Accessibility", "Testing", "Animation", "Rust", "Go"].map((s) => ({ value: s.toLowerCase(), label: s }));

export default function MultiSelectDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label>Skills</Label>
      <MultiSelect options={skills} defaultValue={["react", "tailwind css"]} max={5} placeholder="Pick up to 5 skills" />
    </div>
  );
}
