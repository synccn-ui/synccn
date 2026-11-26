import { ExpandableCard } from "@/registry/ui/expandable-card";

const items = [
  { title: "Saved views", tag: "Data", hue: 250, body: "Save a table's sort, filters and columns as a named view, and share it with your team by link." },
  { title: "Live cursors", tag: "Collaboration", hue: 160, body: "See who's looking at what. Cursors fade after a few seconds of inactivity so they don't get in the way." },
  { title: "Audit log", tag: "Security", hue: 30, body: "Every change, who made it and when, kept for a year and exportable as CSV." },
];

export default function ExpandableCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <ExpandableCard
          key={it.title}
          title={it.title}
          preview={
            <div className="grid gap-3 p-3">
              <div className="h-24 rounded-xl" style={{ background: `linear-gradient(135deg, oklch(0.7 0.14 ${it.hue}), oklch(0.45 0.12 ${it.hue + 40}))` }} aria-hidden />
              <div className="grid gap-0.5 px-1 pb-1">
                <span className="text-xs text-muted-foreground">{it.tag}</span>
                <span className="font-semibold">{it.title}</span>
              </div>
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Press Escape or click outside to close. The card shrinks back into its spot.</p>
        </ExpandableCard>
      ))}
    </div>
  );
}
