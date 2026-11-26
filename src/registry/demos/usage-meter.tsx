import { UsageMeter } from "@/registry/ui/usage-meter";

const upgrade = (
  <a href="#upgrade" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
    Upgrade
  </a>
);

export default function UsageMeterDemo() {
  return (
    <div className="grid w-full max-w-md gap-5 rounded-xl border bg-card p-5">
      <div className="grid gap-0.5">
        <p className="text-sm font-semibold">Usage this period</p>
        <p className="text-[13px] text-muted-foreground">Nov 1 – Nov 30 · Pro plan</p>
      </div>
      <UsageMeter label="API requests" value={412_000} limit={1_000_000} hint="Resets Dec 1" />
      <UsageMeter label="Bandwidth" value={86.4} limit={100} unit="GB" format={(n) => n.toFixed(1).replace(/\.0$/, "")} hint="Resets Dec 1" action={upgrade} />
      <UsageMeter label="Build minutes" value={6_480} limit={6_000} hint="$0.01 per extra minute" action={upgrade} />
      <div className="grid gap-2.5 border-t pt-4">
        <UsageMeter size="compact" label="Seats" value={7} limit={10} format={String} />
        <UsageMeter size="compact" label="Projects" value={23} limit={null} format={String} />
      </div>
    </div>
  );
}
