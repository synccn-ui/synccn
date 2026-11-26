import { Bell, Home, Search, User } from "lucide-react";
import { PhoneMockup } from "@/registry/ui/mockups";

export default function PhoneMockupDemo() {
  return (
    <PhoneMockup>
      <div className="flex h-full flex-col">
        <div className="px-5 pb-3 pt-12">
          <p className="text-xs text-muted-foreground">Good morning</p>
          <p className="text-xl font-semibold">synccn</p>
        </div>
        <div className="mx-4 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,oklch(0.65_0.16_260),oklch(0.3_0.1_280))] p-4 text-white">
          <p className="text-xs opacity-80">Balance</p>
          <p className="text-2xl font-semibold tabular-nums">$12,480</p>
        </div>
        <div className="grid flex-1 content-start gap-2 p-4">
          {["synccn", "synccn", "synccn"].map((n, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border p-2.5 text-sm">
              <span>{n}</span>
              <span className="tabular-nums text-muted-foreground">−${(i + 1) * 24}.00</span>
            </div>
          ))}
        </div>
        <div className="flex justify-around border-t py-3 text-muted-foreground">
          <Home className="size-5 text-foreground" />
          <Search className="size-5" />
          <Bell className="size-5" />
          <User className="size-5" />
        </div>
      </div>
    </PhoneMockup>
  );
}
