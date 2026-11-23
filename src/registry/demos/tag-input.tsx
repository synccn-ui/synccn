import { TagInput } from "@/registry/ui/tag-input";

export default function TagInputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <TagInput
        defaultValue={["react", "tailwind"]}
        max={6}
        suggestions={["typescript", "vite", "accessibility", "animation", "forms", "charts", "dark mode"]}
        placeholder="Add a topic…"
      />
      <p className="text-[13px] text-muted-foreground">Press Enter or comma to add. Up to 6 topics.</p>
    </div>
  );
}
