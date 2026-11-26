import { Masonry } from "@/registry/ui/masonry";

const notes = [
  { h: 90, hue: 250, title: "Moodboard", text: "Calm, dark, a single accent." },
  { h: 130, hue: 160, title: "Release notes", text: "Saved views, live cursors and a faster table." },
  { h: 90, hue: 30, title: "Idea", text: "Keyboard-first onboarding." },
  { h: 110, hue: 300, title: "Bug", text: "Tooltip clipped inside scroll areas on Safari." },
  { h: 110, hue: 200, title: "Copy", text: "Own your components." },
  { h: 140, hue: 120, title: "Research", text: "Six interviews: everyone wants saved filters, nobody wants another settings page." },
  { h: 100, hue: 60, title: "Todo", text: "Ship the changelog." },
  { h: 100, hue: 10, title: "Metric", text: "Activation up 12% after the new checklist." },
];

export default function MasonryDemo() {
  return (
    <Masonry className="max-w-2xl" columnWidth={180}>
      {notes.map((n) => (
        <article key={n.title} className="grid gap-2 overflow-hidden rounded-xl border bg-card">
          <div style={{ height: n.h, background: `linear-gradient(160deg, oklch(0.72 0.12 ${n.hue}), oklch(0.5 0.1 ${n.hue + 30}))` }} aria-hidden />
          <div className="grid gap-0.5 px-3 pb-3">
            <h3 className="text-sm font-semibold">{n.title}</h3>
            <p className="text-[13px] text-muted-foreground">{n.text}</p>
          </div>
        </article>
      ))}
    </Masonry>
  );
}
