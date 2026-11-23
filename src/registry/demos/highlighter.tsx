import { Highlighter } from "@/registry/ui/blur-fade";

export default function HighlighterDemo() {
  return (
    <p className="max-w-md text-center text-xl leading-relaxed">
      The best UI libraries are <Highlighter>copied, not installed</Highlighter>, so you can change{" "}
      <Highlighter color="color-mix(in oklch, oklch(0.7 0.15 250) 45%, transparent)" delay={700}>
        every last detail
      </Highlighter>
      .
    </p>
  );
}
