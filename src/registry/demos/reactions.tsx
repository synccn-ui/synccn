import { Avatar } from "@/registry/ui/avatar";
import { Reactions } from "@/registry/ui/reactions";

export default function ReactionsDemo() {
  return (
    <div className="grid w-full max-w-md gap-3 rounded-2xl border bg-card p-4 pt-14">
      <div className="flex items-center gap-2.5">
        <Avatar name="Riley" size="sm" />
        <span className="text-sm font-medium">Riley</span>
        <span className="text-xs text-muted-foreground">2h ago</span>
      </div>
      <p className="text-sm">The new pricing page is live. Huge thanks to everyone who reviewed it!</p>
      <Reactions defaultValue={{ "🎉": 12, "❤️": 5, "👀": 2 }} defaultMine={["🎉"]} />
    </div>
  );
}
