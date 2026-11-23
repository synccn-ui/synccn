import { Separator } from "@/registry/ui/kbd";

export default function SeparatorDemo() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold">synccn</p>
        <p className="text-[13px] text-muted-foreground">Components you copy, own and keep in sync.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-3 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Themes</span>
      </div>
      <Separator label="or continue with" />
    </div>
  );
}
