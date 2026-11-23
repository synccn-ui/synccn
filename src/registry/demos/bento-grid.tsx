import { Bell, Calendar, FileText, Globe, Search } from "lucide-react";
import { BentoCard, BentoGrid } from "@/registry/ui/bento-grid";
import { Marquee } from "@/registry/ui/marquee";
import { Pattern } from "@/registry/ui/orbit";

export default function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-3xl">
      <BentoCard
        className="md:col-span-2"
        icon={FileText}
        title="Save your files"
        description="Every draft is saved as you type and synced across devices."
        cta="Learn more"
        background={
          <Marquee className="absolute top-6 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]" duration={30}>
            {["report.pdf", "brief.docx", "roadmap.md", "budget.xlsx", "notes.txt"].map((f) => (
              <span key={f} className="rounded-lg border bg-background/60 px-3 py-2 font-mono text-xs">
                {f}
              </span>
            ))}
          </Marquee>
        }
      />
      <BentoCard icon={Bell} title="Notifications" description="Get told about what matters, when it matters." cta="Set up" background={<Pattern variant="dots" />} />
      <BentoCard icon={Globe} title="Multilingual" description="Ship in 40 languages from day one." cta="See languages" background={<Pattern variant="grid" fade="top" />} />
      <BentoCard className="md:col-span-2" icon={Calendar} title="Calendar" description="Schedule work around your team's real availability." cta="Open calendar" />
      <BentoCard className="md:col-span-3" icon={Search} title="Search everything" description="Find any file, message or task in milliseconds." cta="Try it" />
    </BentoGrid>
  );
}
