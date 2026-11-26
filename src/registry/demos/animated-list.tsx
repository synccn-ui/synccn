"use client";

import { CreditCard, GitPullRequest, MessageSquare, UserPlus } from "lucide-react";
import { AnimatedList } from "@/registry/ui/animated-list";

const events = [
  { icon: UserPlus, title: "synccn joined the team", time: "now", tone: "bg-sky-500" },
  { icon: CreditCard, title: "Payment of $240 received", time: "now", tone: "bg-emerald-500" },
  { icon: MessageSquare, title: "synccn commented on Pricing", time: "now", tone: "bg-amber-500" },
  { icon: GitPullRequest, title: "PR #219 ready for review", time: "now", tone: "bg-violet-500" },
];

export default function AnimatedListDemo() {
  return (
    <div className="h-80 w-full max-w-sm overflow-hidden">
      <AnimatedList
        items={events}
        renderItem={(e) => (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-white ${e.tone}`}>
              <e.icon className="size-4" />
            </span>
            <div className="grid flex-1 gap-0.5">
              <p className="text-sm font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
