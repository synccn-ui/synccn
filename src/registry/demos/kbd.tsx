import { Kbd } from "@/registry/ui/kbd";

const rows: [string, string[]][] = [
  ["Open command menu", ["⌘", "K"]],
  ["Toggle theme", ["⌘", "J"]],
  ["Focus search", ["/"]],
  ["Close dialog", ["Esc"]],
];

export default function KbdDemo() {
  return (
    <div className="grid w-full max-w-xs gap-2.5">
      {rows.map(([label, keys]) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="flex gap-1">
            {keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
