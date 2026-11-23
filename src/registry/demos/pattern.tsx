import { Pattern } from "@/registry/ui/orbit";

export default function PatternDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <div className="relative grid h-48 place-items-center overflow-hidden rounded-xl border bg-card">
        <Pattern variant="dots" />
        <p className="relative text-sm font-medium">Dots</p>
      </div>
      <div className="relative grid h-48 place-items-center overflow-hidden rounded-xl border bg-card">
        <Pattern variant="grid" />
        <p className="relative text-sm font-medium">Grid</p>
      </div>
    </div>
  );
}
