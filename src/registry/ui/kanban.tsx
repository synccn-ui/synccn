"use client";

import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanCard {
  id: string;
  title: string;
  tag?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanProps {
  /** Initial columns and cards. */
  columns: KanbanColumn[];
  /** Called after cards move. */
  onChange?: (columns: KanbanColumn[]) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Drag-and-drop board (native HTML5 drag events).
 * columns: [{ id, title, cards: [{ id, title, tag? }] }]
 */
export function Kanban({ columns: initial, className, onChange }: KanbanProps) {
  const [cols, setCols] = useState(initial);
  const [drag, setDrag] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const move = (cardId: string, toCol: string, toIndex?: number) => {
    setCols((prev) => {
      let card: KanbanCard | undefined;
      const without = prev.map((c) => {
        const i = c.cards.findIndex((x) => x.id === cardId);
        if (i >= 0) card = c.cards[i];
        return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };
      });
      const next = without.map((c) => {
        if (c.id !== toCol) return c;
        const cards = [...c.cards];
        if (card) cards.splice(toIndex ?? cards.length, 0, card);
        return { ...c, cards };
      });
      onChange?.(next);
      return next;
    });
  };

  const add = (colId: string) =>
    setCols((prev) => prev.map((c) => (c.id === colId ? { ...c, cards: [...c.cards, { id: `n-${Date.now()}`, title: "New task" }] } : c)));

  return (
    <div className={cn("grid w-full gap-3 sm:grid-cols-3", className)}>
      {cols.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => {
            e.preventDefault();
            setOverCol(col.id);
          }}
          onDragLeave={() => setOverCol(null)}
          onDrop={(e) => {
            e.preventDefault();
            if (drag) move(drag, col.id);
            setDrag(null);
            setOverCol(null);
          }}
          className={cn(
            "flex min-h-40 flex-col gap-2 rounded-xl border bg-muted/50 p-2 transition-colors",
            overCol === col.id && "border-primary/50 bg-brand-soft"
          )}
        >
          <div className="flex items-center justify-between px-1.5 py-1">
            <p className="text-sm font-semibold">
              {col.title} <span className="ml-1 font-normal tabular-nums text-muted-foreground">{col.cards.length}</span>
            </p>
            <button
              type="button"
              onClick={() => add(col.id)}
              aria-label={`Add a card to ${col.title}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {col.cards.map((card, i) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                setDrag(card.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDrag(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (drag && drag !== card.id) move(drag, col.id, i);
                setDrag(null);
                setOverCol(null);
              }}
              className={cn(
                "group flex cursor-grab items-start gap-2 rounded-lg border bg-card p-2.5 text-sm shadow-xs transition-[opacity,transform] active:cursor-grabbing",
                drag === card.id && "rotate-1 opacity-40"
              )}
            >
              <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
              <div className="grid flex-1 gap-1.5">
                <p className="leading-snug">{card.title}</p>
                {card.tag && (
                  <span className="w-fit rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-primary">{card.tag}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
