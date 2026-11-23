"use client";

import { useState } from "react";
import { LoadMore } from "@/registry/ui/nav-extras";

const all = Array.from({ length: 14 }, (_, i) => `Changelog entry ${14 - i}`);

export default function LoadMoreDemo() {
  const [n, setN] = useState(4);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <ul className="grid divide-y rounded-xl border text-sm">
        {all.slice(0, n).map((t) => (
          <li key={t} className="animate-fade px-4 py-2.5">
            {t}
          </li>
        ))}
      </ul>
      <LoadMore hasMore={n < all.length} onLoad={() => new Promise((r) => setTimeout(r, 700)).then(() => setN((x) => Math.min(all.length, x + 4)))} />
    </div>
  );
}
