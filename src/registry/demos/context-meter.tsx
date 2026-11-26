import { ContextMeter } from "@/registry/ui/context-meter";

export default function ContextMeterDemo() {
  return (
    <div className="grid w-full max-w-md gap-4 pt-56">
      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Smart · 200K</span>
        <ContextMeter
          used={68_400}
          limit={200_000}
          breakdown={[
            { label: "System prompt", value: 3_200 },
            { label: "Messages", value: 24_800 },
            { label: "Files", value: 36_100 },
            { label: "Tool results", value: 4_300 },
          ]}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Fast · 128K</span>
        <ContextMeter used={114_000} limit={128_000} hint="Almost full. Start a new chat to keep answers sharp." />
      </div>
    </div>
  );
}
