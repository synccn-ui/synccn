import { BarList } from "@/registry/ui/data-viz";

export default function BarListDemo() {
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4">
      <div className="mb-3 flex justify-between text-sm">
        <span className="font-semibold">Top pages</span>
        <span className="text-muted-foreground">Visitors</span>
      </div>
      <BarList
        data={[
          { name: "/components", value: 18420 },
          { name: "/", value: 12650 },
          { name: "/docs/installation", value: 7340 },
          { name: "/themes", value: 4120 },
          { name: "/blocks", value: 3980 },
          { name: "/components/data-table", value: 2210 },
        ]}
      />
    </div>
  );
}
