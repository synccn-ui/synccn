"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { Button } from "@/registry/ui/button";
import { HoverCard } from "@/registry/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Built and maintained by{" "}
      <HoverCard
        trigger={
          <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
            @synccn
          </a>
        }
      >
        <div className="grid gap-3 text-left">
          <div className="flex items-start justify-between">
            <Avatar name="synccn" size="lg" status="online" />
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
          <div className="grid gap-0.5">
            <p className="font-semibold text-foreground">synccn</p>
            <p className="text-[13px]">synccn@example.com</p>
          </div>
          <p className="text-[13px] text-foreground">Design engineer. Writes components and the docs that explain them.</p>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> Los Angeles
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> Joined 2024
            </span>
          </div>
        </div>
      </HoverCard>
    </p>
  );
}
