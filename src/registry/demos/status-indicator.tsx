import { StatusIndicator, type Status } from "@/registry/ui/status-indicator";

const services: [string, Status][] = [
  ["API", "online"],
  ["Dashboard", "online"],
  ["Webhooks", "away"],
  ["Email delivery", "busy"],
  ["Search", "info"],
];

export default function StatusIndicatorDemo() {
  return (
    <div className="grid w-full max-w-sm divide-y rounded-xl border">
      {services.map(([name, s]) => (
        <div key={name} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="font-medium">{name}</span>
          <StatusIndicator status={s} className="text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}
