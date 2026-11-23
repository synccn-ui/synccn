import { BrowserMockup } from "@/registry/ui/mockups";

export default function BrowserMockupDemo() {
  return (
    <BrowserMockup url="my-app.com/dashboard" className="max-w-xl">
      <div className="grid gap-3 p-5">
        <div className="h-3 w-32 rounded bg-foreground/80" />
        <div className="h-2 w-56 rounded bg-muted-foreground/30" />
        <div className="mt-2 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg border bg-muted/40" />
          ))}
        </div>
        <div className="h-32 rounded-lg border bg-[linear-gradient(to_top,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent)]" />
      </div>
    </BrowserMockup>
  );
}
