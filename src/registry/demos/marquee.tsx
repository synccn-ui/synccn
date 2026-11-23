import { Marquee } from "@/registry/ui/marquee";

const tags = ["Accessible", "Themeable", "Copy & paste", "Dark mode", "Keyboard first", "Tailwind v4", "React 19", "Zero runtime deps", "Responsive", "Open source"];

export default function MarqueeDemo() {
  return (
    <div className="grid w-full max-w-xl gap-3 overflow-hidden">
      <Marquee duration={28}>
        {tags.map((t) => (
          <span key={t} className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium whitespace-nowrap">
            {t}
          </span>
        ))}
      </Marquee>
      <Marquee duration={34} reverse>
        {tags.slice().reverse().map((t) => (
          <span key={t} className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground whitespace-nowrap">
            {t}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
