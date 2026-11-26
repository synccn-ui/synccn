"use client";

import { BarChart3, Bell, Folder, Home, Inbox, LifeBuoy, Settings, Users } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { Sidebar } from "@/registry/ui/sidebar";
import { Skeleton } from "@/registry/ui/skeleton";

export default function SidebarDemo() {
  return (
    <Sidebar
      className="h-[440px] max-w-3xl"
      header={<span className="text-sm font-semibold">Workspace</span>}
      groups={[
        {
          label: "General",
          items: [
            { label: "Home", icon: Home },
            { label: "Inbox", icon: Inbox, badge: 4 },
            { label: "Projects", icon: Folder, children: [{ label: "Website" }, { label: "Mobile app" }, { label: "Design system" }] },
            { label: "Reports", icon: BarChart3 },
          ],
        },
        {
          label: "Team",
          items: [
            { label: "Members", icon: Users },
            { label: "Notifications", icon: Bell },
            { label: "Settings", icon: Settings },
            { label: "Support", icon: LifeBuoy },
          ],
        },
      ]}
      footer={(collapsed) => (
        <div className="flex items-center gap-2.5 rounded-lg p-1.5">
          <Avatar name="synccn" size="sm" status="online" />
          {!collapsed && (
            <div className="grid min-w-0 text-left">
              <span className="truncate text-sm font-medium">synccn</span>
              <span className="truncate text-xs text-muted-foreground">synccn@example.com</span>
            </div>
          )}
        </div>
      )}
    >
      {(active) => (
        <div className="grid gap-4 p-5">
          <p className="text-lg font-semibold">{active}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 animate-none" />
            <Skeleton className="h-24 animate-none" />
            <Skeleton className="h-24 animate-none" />
          </div>
          <Skeleton className="h-40 animate-none" />
        </div>
      )}
    </Sidebar>
  );
}
