"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmojiPickerProps {
  /** Called with the chosen emoji and its name. */
  onSelect: (emoji: string, name: string) => void;
  /** Emoji shown in "Recent" at first, newest first. */
  recent?: string[];
  /**
   * Columns in the grid.
   * @default 8
   */
  columns?: number;
  /** Extra classes for the root element. */
  className?: string;
}

type Entry = [emoji: string, name: string];
const CATEGORIES: { id: string; label: string; icon: string; items: Entry[] }[] = [
  { id: "smileys", label: "Smileys", icon: "😀", items: [["😀", "grinning"], ["😃", "smiley"], ["😄", "smile"], ["😁", "grin"], ["😆", "laughing"], ["😅", "sweat smile"], ["🤣", "rofl"], ["😂", "joy tears"], ["🙂", "slight smile"], ["😉", "wink"], ["😊", "blush"], ["😇", "innocent halo"], ["🥰", "love hearts"], ["😍", "heart eyes"], ["🤩", "star struck"], ["😘", "kiss"], ["😋", "yum"], ["😜", "wink tongue"], ["🤪", "zany"], ["🤓", "nerd"], ["😎", "cool sunglasses"], ["🥳", "party"], ["🤔", "thinking"], ["🫡", "salute"], ["🤗", "hug"], ["🙃", "upside down"], ["😐", "neutral"], ["😴", "sleeping"], ["😬", "grimace"], ["🙄", "eye roll"], ["😮", "surprised"], ["😢", "cry sad"], ["😭", "sob"], ["😤", "triumph"], ["😡", "angry"], ["🤯", "mind blown"], ["😱", "scream"], ["🥲", "smile tear"], ["🤐", "zipper mouth"], ["🫠", "melting"]] },
  { id: "people", label: "Gestures", icon: "👍", items: [["👍", "thumbs up yes"], ["👎", "thumbs down no"], ["👏", "clap"], ["🙌", "raised hands"], ["👋", "wave hello"], ["🙏", "pray thanks please"], ["🤝", "handshake deal"], ["✌️", "peace victory"], ["🤞", "fingers crossed luck"], ["👌", "ok"], ["🤌", "pinched"], ["👀", "eyes look"], ["💪", "muscle strong"], ["🫶", "heart hands"], ["☝️", "point up"], ["👉", "point right"], ["✍️", "writing"], ["🧠", "brain"], ["🫣", "peek"], ["🤦", "facepalm"], ["🤷", "shrug"], ["🙋", "raise hand"], ["🧑‍💻", "developer coder"], ["🕺", "dance"]] },
  { id: "nature", label: "Animals and nature", icon: "🐶", items: [["🐶", "dog"], ["🐱", "cat"], ["🦊", "fox"], ["🐻", "bear"], ["🐼", "panda"], ["🐨", "koala"], ["🦁", "lion"], ["🐸", "frog"], ["🐵", "monkey"], ["🐧", "penguin"], ["🦄", "unicorn"], ["🐝", "bee"], ["🦋", "butterfly"], ["🐢", "turtle slow"], ["🐙", "octopus"], ["🦕", "dinosaur"], ["🌵", "cactus"], ["🌲", "tree"], ["🌸", "blossom flower"], ["🌻", "sunflower"], ["🍀", "clover luck"], ["🌈", "rainbow"], ["⭐", "star"], ["🌙", "moon"], ["☀️", "sun"], ["⚡", "lightning zap fast"], ["❄️", "snow"], ["🌊", "wave ocean"]] },
  { id: "food", label: "Food and drink", icon: "🍕", items: [["🍎", "apple"], ["🍌", "banana"], ["🍓", "strawberry"], ["🍑", "peach"], ["🥑", "avocado"], ["🌶️", "pepper hot"], ["🍕", "pizza"], ["🍔", "burger"], ["🌮", "taco"], ["🍣", "sushi"], ["🍜", "noodles ramen"], ["🍩", "donut"], ["🍪", "cookie"], ["🎂", "cake birthday"], ["🍿", "popcorn"], ["☕", "coffee"], ["🍵", "tea"], ["🧋", "bubble tea"], ["🍺", "beer"], ["🥂", "cheers"]] },
  { id: "activity", label: "Activities", icon: "🎉", items: [["🎉", "tada party celebrate"], ["🎊", "confetti"], ["🎈", "balloon"], ["🎁", "gift present"], ["🏆", "trophy win"], ["🥇", "gold medal first"], ["⚽", "soccer"], ["🏀", "basketball"], ["🎮", "game controller"], ["🎯", "target goal"], ["🎨", "art palette design"], ["🎸", "guitar"], ["🎧", "headphones music"], ["🎬", "movie"], ["🧩", "puzzle"], ["♟️", "chess"]] },
  { id: "objects", label: "Objects", icon: "💡", items: [["💡", "idea bulb"], ["🔥", "fire hot lit"], ["🚀", "rocket ship launch"], ["💻", "laptop computer"], ["⌨️", "keyboard"], ["🖱️", "mouse"], ["📱", "phone mobile"], ["📦", "package box"], ["🔧", "wrench fix"], ["🛠️", "tools"], ["🐛", "bug"], ["🔒", "lock secure"], ["🔑", "key"], ["📌", "pin"], ["📎", "paperclip"], ["📝", "memo note"], ["📊", "chart bar"], ["📈", "chart up growth"], ["📅", "calendar"], ["⏰", "alarm clock"], ["💰", "money bag"], ["💳", "card"], ["✉️", "envelope mail"], ["🔔", "bell notification"]] },
  { id: "symbols", label: "Symbols", icon: "❤️", items: [["❤️", "red heart love"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"], ["💙", "blue heart"], ["💜", "purple heart"], ["🖤", "black heart"], ["💔", "broken heart"], ["✅", "check done yes"], ["❌", "cross no"], ["⚠️", "warning"], ["⛔", "no entry"], ["❓", "question"], ["❗", "exclamation"], ["💯", "hundred perfect"], ["✨", "sparkles new"], ["💥", "boom"], ["💬", "speech comment"], ["➕", "plus"], ["🆕", "new"], ["🔴", "red circle"], ["🟢", "green circle"], ["🟡", "yellow circle"], ["🔵", "blue circle"]] },
];

/**
 * Emoji picker with categories, search by name, recently used and full keyboard support.
 * Ships its own small, curated set (about 180 emoji) so there's nothing to download.
 */
export function EmojiPicker({ onSelect, recent: initialRecent = [], columns = 8, className }: EmojiPickerProps) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(initialRecent);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<Entry | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const names = useMemo(() => new Map(CATEGORIES.flatMap((c) => c.items).map(([e, n]) => [e, n])), []);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const hits = CATEGORIES.flatMap((c) => c.items).filter(([, n]) => n.includes(q));
      return [{ id: "results", label: hits.length ? "Results" : "No matches", items: hits }];
    }
    const rec: Entry[] = recent.slice(0, columns * 2).map((e) => [e, names.get(e) ?? "emoji"]);
    return [...(rec.length ? [{ id: "recent", label: "Recent", items: rec }] : []), ...CATEGORIES];
  }, [query, recent, names, columns]);
  const flat = sections.flatMap((s) => s.items);

  const choose = ([e, n]: Entry) => {
    setRecent((r) => [e, ...r.filter((x) => x !== e)].slice(0, 24));
    onSelect(e, n);
  };

  const focusAt = (i: number) => {
    const j = Math.max(0, Math.min(flat.length - 1, i));
    setActive(j);
    grid.current?.querySelector<HTMLElement>(`[data-i="${j}"]`)?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[e.key];
    if (step) return e.preventDefault(), focusAt(i + step);
    if (e.key === "Home") return e.preventDefault(), focusAt(0);
    if (e.key === "End") return e.preventDefault(), focusAt(flat.length - 1);
  };

  let index = -1;
  const shownEntry = hovered ?? flat[active] ?? null;
  return (
    <div className={cn("grid w-[19rem] max-w-full overflow-hidden rounded-xl border bg-popover text-left text-popover-foreground", className)}>
      <div className="border-b p-2">
        <label className="flex h-8 items-center gap-2 rounded-md bg-muted/60 px-2.5">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => (setQuery(e.target.value), setActive(0))}
            onKeyDown={(e) => e.key === "ArrowDown" && flat.length && (e.preventDefault(), focusAt(0))}
            placeholder="Search emoji"
            aria-label="Search emoji"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      {!query && (
        <div className="flex justify-between border-b px-1.5 py-1" role="toolbar" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              title={c.label}
              onClick={() => grid.current?.querySelector(`[data-section="${c.id}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" })}
              className="grid size-7 place-items-center rounded-md text-base grayscale transition hover:bg-accent hover:grayscale-0"
            >
              {c.icon}
            </button>
          ))}
        </div>
      )}
      <div ref={grid} className="h-64 overflow-y-auto overscroll-contain px-1.5 pb-1.5" onPointerLeave={() => setHovered(null)}>
        {sections.map((s) => (
          <section key={s.id} data-section={s.id} aria-label={s.label}>
            <p className="sticky top-0 z-[1] bg-popover/95 px-1 pb-1 pt-2 text-[11px] font-medium text-muted-foreground backdrop-blur">{s.label}</p>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {s.items.map((it) => {
                const i = ++index;
                return (
                  <button
                    key={`${s.id}-${it[0]}`}
                    data-i={i}
                    type="button"
                    tabIndex={i === active ? 0 : -1}
                    aria-label={it[1].split(" ")[0]}
                    onClick={() => choose(it)}
                    onKeyDown={(e) => onKey(e, i)}
                    onFocus={() => setActive(i)}
                    onPointerEnter={() => setHovered(it)}
                    className="grid aspect-square place-items-center rounded-md text-xl transition-transform hover:scale-110 hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {it[0]}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="flex h-10 items-center gap-2 border-t px-3 text-[13px]">
        {shownEntry ? (
          <>
            <span className="text-xl">{shownEntry[0]}</span>
            <span className="truncate capitalize text-muted-foreground">{shownEntry[1].split(" ")[0]}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Pick an emoji</span>
        )}
      </div>
    </div>
  );
}
