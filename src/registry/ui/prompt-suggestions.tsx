import type * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PromptSuggestion {
  /** Short text on the chip or card. */
  label: string;
  /** Full prompt sent when chosen. Defaults to the label. */
  prompt?: string;
  /** Second line on cards. */
  description?: string;
  icon?: React.ElementType;
}

export interface PromptSuggestionsProps {
  suggestions: PromptSuggestion[];
  /** Called with the prompt to send. */
  onSelect: (prompt: string) => void;
  /**
   * "chips" for follow-ups under an answer, "cards" for an empty chat.
   * @default "chips"
   */
  variant?: "chips" | "cards";
  /** Extra classes for the root element. */
  className?: string;
}

/** Starter prompts for an empty chat (cards) or follow-up questions under an answer (chips). */
export function PromptSuggestions({ suggestions, onSelect, variant = "chips", className }: PromptSuggestionsProps) {
  if (variant === "cards") {
    return (
      <ul className={cn("grid w-full gap-2 sm:grid-cols-2", className)}>
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.label}>
              <button type="button" onClick={() => onSelect(s.prompt ?? s.label)} className="group flex h-full w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-[background-color,border-color,transform] hover:border-foreground/20 hover:bg-muted/40 active:scale-[0.99]">
                {Icon && (
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden>
                    <Icon className="size-4" />
                  </span>
                )}
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="text-sm font-medium">{s.label}</span>
                  {s.description && <span className="text-[13px] leading-snug text-muted-foreground">{s.description}</span>}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Suggestions">
      {suggestions.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.label}>
            <button type="button" onClick={() => onSelect(s.prompt ?? s.label)} className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border bg-card px-3 text-[13px] text-muted-foreground shadow-xs transition-colors hover:bg-muted/60 hover:text-foreground">
              {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
              <span className="truncate">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
