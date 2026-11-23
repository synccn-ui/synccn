import { ComparisonTable } from "@/registry/ui/comparison-table";

export default function ComparisonTableDemo() {
  return (
    <ComparisonTable
      className="max-w-2xl"
      plans={[{ name: "Starter", price: "Free" }, { name: "Pro", price: "$12/mo", featured: true }, { name: "Team", price: "$39/mo" }]}
      groups={[
        {
          title: "Components",
          rows: [
            { feature: "Core components", values: [true, true, true] },
            { feature: "Blocks", values: ["5", "All", "All"] },
            { feature: "Theme builder export", values: [false, true, true] },
          ],
        },
        {
          title: "Collaboration",
          rows: [
            { feature: "Seats", values: ["1", "1", "Up to 20"] },
            { feature: "Shared themes", values: [false, false, true] },
            { feature: "Priority support", values: [false, true, true] },
          ],
        },
      ]}
    />
  );
}
