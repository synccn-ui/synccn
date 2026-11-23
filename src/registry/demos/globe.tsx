import { Globe } from "@/registry/ui/globe";

const offices = [
  { lat: 34.05, lng: -118.24 },
  { lat: 51.5, lng: -0.12 },
  { lat: 35.68, lng: 139.69 },
  { lat: -33.87, lng: 151.21 },
  { lat: 40.71, lng: -74.0 },
];

export default function GlobeDemo() {
  return (
    <div className="grid justify-items-center gap-2">
      <Globe markers={offices} />
      <p className="text-xs text-muted-foreground">Drag to spin it.</p>
    </div>
  );
}
