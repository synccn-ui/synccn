import { RadarChart } from "@/registry/ui/radar-chart";

export default function RadarChartDemo() {
  return (
    <RadarChart
      axes={["Speed", "Bundle size", "Accessibility", "Docs", "TypeScript", "Theming"]}
      max={10}
      series={[
        { name: "Library A", values: [9, 8, 7, 6, 9, 8] },
        { name: "Library B", values: [6, 5, 9, 9, 7, 6] },
      ]}
      format={(v) => `${v} / 10`}
    />
  );
}
