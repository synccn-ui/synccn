import { Meteors } from "@/registry/ui/orbit";

export default function MeteorsDemo() {
  return (
    <div className="relative grid h-64 w-full max-w-md place-items-center overflow-hidden rounded-2xl border bg-card">
      <Meteors count={16} />
      <div className="relative grid gap-1 text-center">
        <p className="text-xl font-semibold tracking-tight">Ship tonight</p>
        <p className="text-sm text-muted-foreground">A quiet background for launch pages.</p>
      </div>
    </div>
  );
}
