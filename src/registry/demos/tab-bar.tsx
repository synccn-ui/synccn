"use client";

import { useState } from "react";
import { Compass, Home, MessageCircle, User } from "lucide-react";
import { TabBar } from "@/registry/ui/nav-extras";

const tabs = [
  { value: "home", label: "Home", icon: Home },
  { value: "explore", label: "Explore", icon: Compass },
  { value: "inbox", label: "Inbox", icon: MessageCircle, badge: 3 },
  { value: "profile", label: "Profile", icon: User },
];

export default function TabBarDemo() {
  const [tab, setTab] = useState("home");
  return (
    <div className="flex h-96 w-72 flex-col overflow-hidden rounded-[28px] border bg-background shadow-xl">
      <div className="grid flex-1 place-items-center text-lg font-semibold capitalize">{tab}</div>
      <TabBar items={tabs} value={tab} onValueChange={setTab} />
    </div>
  );
}
