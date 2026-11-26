import { Citation, Sources, type Source } from "@/registry/ui/sources";

const sources: Source[] = [
  { title: "Using the Popover API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using", snippet: "Popovers created with the popover attribute are rendered in the top layer, above all other content." },
  { title: "Anchor positioning", url: "https://web.dev/blog/anchor-positioning-api", snippet: "Tether an element to another and keep it on screen with position-try fallbacks." },
  { title: "Baseline 2025 features", url: "https://web-platform-dx.github.io/web-features/", snippet: "Features that work across the latest versions of every major browser." },
];

export default function SourcesDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3 rounded-xl border bg-card p-5 text-sm leading-relaxed">
      <p>
        You can drop most JavaScript tooltip libraries now. The Popover API puts the panel in the top layer
        <Citation index={1} source={sources[0]} />, and CSS anchor positioning keeps it next to its button
        <Citation index={2} source={sources[1]} />. Both are Baseline in current browsers
        <Citation index={3} source={sources[2]} />.
      </p>
      <Sources sources={sources} />
    </div>
  );
}
