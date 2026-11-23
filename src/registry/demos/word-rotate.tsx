import { WordRotate } from "@/registry/ui/shimmer-text";

export default function WordRotateDemo() {
  return (
    <p className="text-center text-3xl font-semibold tracking-tight">
      Components that feel{" "}
      <WordRotate words={["fast", "familiar", "accessible", "yours"]} className="text-primary" />
    </p>
  );
}
