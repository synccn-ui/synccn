"use client";

import { useMemo } from "react";
import { GitBranch, KeyRound, Rocket } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { ActivityTimeline, type ActivityEvent } from "@/registry/ui/activity-timeline";

const ago = (now: number, minutes: number) => new Date(now - minutes * 60000);

export default function ActivityTimelineDemo() {
  // Times are relative to now, which the browser fills in after loading.
  const now = useNow();
  const events = useMemo<ActivityEvent[]>(() => {
    const t = now ? now.getTime() : Date.UTC(2026, 10, 23, 12);
    return [
      { id: "1", actor: { name: "Michael" }, action: "deployed", target: "api-gateway v2.14", time: ago(t, 4), type: "deploy", icon: Rocket, status: "success", details: <p className="font-mono text-xs">Build 1842 · 38s · 3 regions healthy</p> },
      { id: "2", actor: { name: "Riley" }, action: "commented on", target: "Billing retries", time: ago(t, 52), type: "comment", details: "Can we cap retries at three? Stripe already backs off." },
      { id: "3", actor: { name: "Jayden" }, action: "rotated the key", target: "Production webhook", time: ago(t, 190), type: "security", icon: KeyRound, status: "warning" },
      { id: "4", actor: { name: "Michael" }, action: "merged", target: "#482 Saved table views", time: ago(t, 60 * 22), type: "code", icon: GitBranch, status: "info" },
      { id: "5", actor: { name: "Riley" }, action: "deployed", target: "web v5.2", time: ago(t, 60 * 26), type: "deploy", icon: Rocket, status: "error", details: <p className="font-mono text-xs">Rolled back: health check failed in eu-west-1</p> },
      { id: "6", actor: { name: "Jayden" }, action: "invited", target: "avery@example.com", time: ago(t, 60 * 50), type: "team" },
    ];
  }, [now]);
  return (
    <div className="w-full max-w-lg rounded-xl border bg-card p-5">
      <ActivityTimeline events={events} types={{ deploy: "Deploys", code: "Code", comment: "Comments", security: "Security" }} />
    </div>
  );
}
