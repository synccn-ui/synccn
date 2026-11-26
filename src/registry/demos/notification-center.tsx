"use client";

import { CreditCard, GitPullRequest, Rocket } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { NotificationCenter } from "@/registry/ui/notification-center";
import { toast } from "@/registry/ui/toast";

export default function NotificationCenterDemo() {
  return (
    <div className="flex h-[440px] w-full max-w-md items-start justify-end pt-2">
      <NotificationCenter
        onOpenSettings={() => toast("Opening notification settings")}
        items={[
          { id: 1, avatar: <Avatar name="synccn" size="md" />, title: "synccn mentioned you in Pricing page", body: "“Can you check the yearly toggle copy before we ship?”", time: "5 min ago" },
          { id: 2, icon: GitPullRequest, title: "synccn opened pull request #231", body: "Add week view to Calendar", time: "1 hr ago" },
          { id: 3, icon: Rocket, title: "Production deploy finished", time: "3 hr ago", read: true },
          { id: 4, icon: CreditCard, title: "Your invoice for March is ready", time: "Yesterday", read: true },
        ]}
      />
    </div>
  );
}
