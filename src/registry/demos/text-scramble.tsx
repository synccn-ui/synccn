import { TextScramble } from "@/registry/ui/shimmer-text";

export default function TextScrambleDemo() {
  return (
    <div className="grid justify-items-center gap-3">
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
        <TextScramble text="SYNC COMPLETE" />
      </p>
      <p className="text-[13px] text-muted-foreground">Hover the text to run it again.</p>
    </div>
  );
}
