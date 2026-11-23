import { Aurora } from "@/registry/ui/aurora";

export default function AuroraDemo() {
  return (
    <div className="relative grid h-72 w-full max-w-xl place-items-center overflow-hidden rounded-2xl border bg-background">
      <Aurora />
      <div className="relative grid gap-2 text-center">
        <p className="text-4xl font-semibold tracking-tighter">Aurora</p>
        <p className="text-sm text-muted-foreground">Soft light that drifts behind your hero.</p>
      </div>
    </div>
  );
}
