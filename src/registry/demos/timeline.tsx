import { GitMerge, Rocket, TriangleAlert } from "lucide-react";
import { Timeline } from "@/registry/ui/timeline";

export default function TimelineDemo() {
  return (
    <Timeline
      className="w-full max-w-sm"
      items={[
        { title: "Deployed to production", time: "2 min ago", icon: Rocket, tone: "success", description: "Build 4f2a1c went live on all regions." },
        { title: "Merged pull request #218", time: "18 min ago", icon: GitMerge, tone: "primary", description: "Add range mode to Calendar." },
        { title: "Preview build failed", time: "1 hr ago", icon: TriangleAlert, tone: "destructive" },
        { title: "Branch created", time: "Yesterday" },
      ]}
    />
  );
}
