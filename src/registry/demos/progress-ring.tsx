import { ProgressRing } from "@/registry/ui/progress";

export default function ProgressRingDemo() {
  return (
    <div className="flex items-center gap-6">
      <ProgressRing value={32} size={56} stroke={5} />
      <ProgressRing value={68} />
      <ProgressRing value={91} size={96} stroke={9}>
        <span className="grid text-center leading-tight">
          <span className="text-lg">91</span>
          <span className="text-[10px] font-normal text-muted-foreground">score</span>
        </span>
      </ProgressRing>
    </div>
  );
}
