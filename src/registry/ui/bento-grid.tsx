import type * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BentoGridProps {
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Asymmetric feature grid. Give cards className="md:col-span-2" or "md:row-span-2" to vary sizes. */
export function BentoGrid({ className, children }: BentoGridProps) {
  return <div className={cn("grid w-full auto-rows-[minmax(13rem,auto)] gap-3 md:grid-cols-3", className)}>{children}</div>;
}

export interface BentoCardProps {
  /** Icon above the title. */
  icon?: React.ElementType;
  /** Card heading. */
  title: React.ReactNode;
  /** Supporting text. */
  description?: React.ReactNode;
  /** Link text revealed on hover. */
  cta?: React.ReactNode;
  /** Decorative layer behind the content. */
  background?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function BentoCard({ icon: Icon, title, description, cta, background, className }: BentoCardProps) {
  return (
    <div className={cn("surface group relative flex flex-col justify-end overflow-hidden rounded-2xl border p-5", className)}>
      {background && (
        <div className="pointer-events-none absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">{background}</div>
      )}
      <div className="relative z-10 grid gap-1.5 transition-transform duration-300 group-hover:-translate-y-6">
        {Icon && <Icon className="mb-1 size-6 text-foreground/80 transition-transform duration-300 group-hover:scale-90" />}
        <h3 className="font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {cta && (
        <span className="absolute bottom-5 left-5 z-10 inline-flex translate-y-4 items-center gap-1 text-sm font-medium opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {cta} <ArrowRight className="size-3.5" />
        </span>
      )}
    </div>
  );
}
