"use client";

import { useRef } from "react";
import { TableOfContents } from "@/registry/ui/nav-extras";

const sections: { id: string; label: string; level?: 1 | 2 }[] = [
  { id: "toc-intro", label: "Introduction" },
  { id: "toc-install", label: "Installation" },
  { id: "toc-vite", label: "Vite", level: 2 },
  { id: "toc-next", label: "Next.js", level: 2 },
  { id: "toc-theming", label: "Theming" },
  { id: "toc-faq", label: "FAQ" },
];

export default function TableOfContentsDemo() {
  const box = useRef(null);
  return (
    <div className="grid w-full max-w-xl grid-cols-[1fr_140px] gap-6 rounded-xl border p-4">
      <div ref={box} className="h-64 overflow-y-auto pr-2 scrollbar-thin">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="mb-6">
            <h3 className={s.level === 2 ? "text-sm font-semibold" : "text-base font-semibold"}>{s.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Scroll this panel and watch the contents on the right follow along. Clicking an item scrolls to its section.
            </p>
          </section>
        ))}
      </div>
      <TableOfContents items={sections} root={box} />
    </div>
  );
}
