import { FunnelChart } from "@/registry/ui/data-viz";

export default function FunnelChartDemo() {
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-5">
      <p className="mb-4 font-semibold">Signup funnel</p>
      <FunnelChart
        data={[
          { label: "Visited pricing", value: 24800 },
          { label: "Started signup", value: 9120 },
          { label: "Verified email", value: 6340 },
          { label: "Created project", value: 4210 },
          { label: "Upgraded", value: 920 },
        ]}
      />
    </div>
  );
}
