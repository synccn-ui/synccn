import type * as React from "react";
import { Atom, Braces, Database, PenTool, GitBranch, Palette, Terminal } from "lucide-react";
import { Orbit } from "@/registry/ui/orbit";

const Chip = ({ icon: Icon }: { icon: React.ElementType }) => (
  <span className="grid size-10 place-items-center rounded-full border bg-card shadow-sm">
    <Icon className="size-4" />
  </span>
);

export default function OrbitDemo() {
  return (
    <div className="relative grid h-80 w-full max-w-md place-items-center overflow-hidden">
      <span className="z-10 grid size-14 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg">sc</span>
      <Orbit radius={70} duration={18}>
        <Chip icon={Atom} />
        <Chip icon={Palette} />
        <Chip icon={Terminal} />
      </Orbit>
      <Orbit radius={130} duration={30} reverse>
        <Chip icon={Braces} />
        <Chip icon={Database} />
        <Chip icon={GitBranch} />
        <Chip icon={PenTool} />
      </Orbit>
    </div>
  );
}
