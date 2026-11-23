"use client";

import { Calendar, Folder, Home, Mail, Music, Search, Settings } from "lucide-react";
import { Dock } from "@/registry/ui/dock";
import { toast } from "@/registry/ui/toast";

export default function DockDemo() {
  const open = (label: string) => () => toast(`Opened ${label}`);
  return (
    <div className="flex w-full justify-center pt-10">
      <Dock
        items={[
          { label: "Home", icon: Home, active: true, onClick: open("Home") },
          { label: "Search", icon: Search, onClick: open("Search") },
          { label: "Files", icon: Folder, onClick: open("Files") },
          { label: "Mail", icon: Mail, active: true, onClick: open("Mail") },
          { label: "Calendar", icon: Calendar, onClick: open("Calendar") },
          { label: "Music", icon: Music, onClick: open("Music") },
          { label: "Settings", icon: Settings, onClick: open("Settings") },
        ]}
      />
    </div>
  );
}
