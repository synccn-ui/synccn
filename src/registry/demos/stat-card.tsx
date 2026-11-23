import { DollarSign, Users } from "lucide-react";
import { StatCard } from "@/registry/ui/stat-card";

export default function StatCardDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <StatCard label="Revenue" value="$48,290" change={12.4} icon={DollarSign} trend={[12, 14, 13, 17, 16, 20, 22, 21, 26]} />
      <StatCard label="Active users" value="3,912" change={-2.1} icon={Users} trend={[30, 28, 31, 29, 27, 28, 26, 27, 25]} />
    </div>
  );
}
