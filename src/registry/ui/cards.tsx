"use client";

import type * as React from "react";
import { useState } from "react";
import { Check, Heart, MapPin, MessageCircle, Repeat2, Share, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/registry/ui/avatar";

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export interface ProfileCardProps {
  /** Person's name. */
  name: string;
  /** Username, e.g. @michael. */
  handle?: string;
  /** Job title shown after the handle. */
  role?: string;
  /** City or region. */
  location?: string;
  /** Short description. */
  bio?: React.ReactNode;
  /** Up to three numbers shown in a row. */
  stats?: { label: string; value: number }[];
  /** CSS background for the cover strip. */
  cover?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Person card with a cover, stats and follow/message actions. */
export function ProfileCard({
  name,
  handle,
  role,
  location,
  bio,
  stats = [],
  cover = "linear-gradient(120deg, oklch(0.45 0.08 260), oklch(0.3 0.05 300))",
  className,
}: ProfileCardProps) {
  const [following, setFollowing] = useState(false);
  return (
    <div className={cn("surface w-full max-w-sm overflow-hidden rounded-2xl border", className)}>
      <div className="h-24" style={{ background: cover }} />
      <div className="px-5 pb-5">
        <div className="-mt-9 flex items-end justify-between">
          <Avatar
            name={name}
            size="lg"
            status="online"
            className="[&>span:first-child]:size-[72px] [&>span:first-child]:ring-4 [&>span:first-child]:text-2xl"
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Message"
              className="grid size-9 place-items-center rounded-md border bg-background hover:bg-accent"
            >
              <MessageCircle className="size-4" />
            </button>
            <button
              type="button"
              aria-pressed={following}
              onClick={() => setFollowing(!following)}
              className={cn(
                "inline-flex h-9 min-w-24 items-center justify-center gap-1.5 rounded-md px-4 text-sm font-medium transition-colors",
                following ? "border bg-background hover:bg-accent" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {following && <Check className="size-4" />}
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-0.5">
          <p className="text-lg font-semibold tracking-tight">{name}</p>
          <p className="text-sm text-muted-foreground">
            {handle}
            {role && ` · ${role}`}
          </p>
        </div>
        {bio && <p className="mt-3 text-sm leading-relaxed">{bio}</p>}
        {location && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {location}
          </p>
        )}
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-3 divide-x rounded-xl border text-center">
            {stats.map((s) => (
              <div key={s.label} className="py-2.5">
                <p className="font-semibold tabular-nums">{fmt(s.value + (s.label === "Followers" && following ? 1 : 0))}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface PricingCardProps {
  /** Plan name. */
  name: string;
  /** Formatted price, e.g. $12. */
  price: string;
  /** Text after the price. */
  period?: string;
  /** One line under the name. */
  description?: React.ReactNode;
  /** Included features. */
  features?: string[];
  /** Button text. */
  cta?: string;
  /** Highlights the card. */
  featured?: boolean;
  /** Label pinned to the top edge. */
  badge?: string;
  /** Called when the button is clicked. */
  onSelect?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** One plan: name, price, features and a call to action. Set featured for emphasis. */
export function PricingCard({
  name,
  price,
  period = "per month",
  description,
  features = [],
  cta = "Get started",
  featured = false,
  badge,
  onSelect,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "surface relative flex w-full max-w-xs flex-col rounded-2xl border p-6",
        featured && "border-foreground/30 shadow-[0_0_0_1px_var(--foreground)]",
        className
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">{badge}</span>
      )}
      <p className="font-semibold">{name}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="mt-6 grid flex-1 gap-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "mt-7 h-10 rounded-md text-sm font-medium transition-colors",
          featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border bg-background hover:bg-accent"
        )}
      >
        {cta}
      </button>
    </div>
  );
}

export interface TestimonialCardProps {
  /** The quote. */
  quote: React.ReactNode;
  /** Who said it. */
  name: string;
  /** Their role or company. */
  role?: string;
  /** Stars out of 5. */
  rating?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Quote card for customer stories. Use real quotes you have permission to publish. */
export function TestimonialCard({ quote, name, role, rating, className }: TestimonialCardProps) {
  return (
    <figure className={cn("surface grid w-full max-w-sm gap-4 rounded-2xl border p-6", className)}>
      <Quote className="size-5 text-muted-foreground/60" />
      {rating && (
        <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? "" : "opacity-25"}>
              ★
            </span>
          ))}
        </div>
      )}
      <blockquote className="text-[15px] leading-relaxed">{quote}</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <span className="grid">
          <span className="text-sm font-medium">{name}</span>
          {role && <span className="text-xs text-muted-foreground">{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export interface PostCardProps {
  /** Author name. */
  name: string;
  /** Author username. */
  handle?: string;
  /** Relative time, e.g. 3h. */
  time?: string;
  /** Image or video under the text. */
  media?: React.ReactNode;
  /** Starting like count. */
  likes?: number;
  /** Starting repost count. */
  reposts?: number;
  /** Reply count. */
  replies?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Social post with like, repost and share actions that update their counts. */
export function PostCard({ name, handle, time, children, media, likes = 0, reposts = 0, replies = 0, className }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const act = "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs tabular-nums text-muted-foreground transition-colors";
  return (
    <article className={cn("surface w-full max-w-md rounded-2xl border p-4", className)}>
      <header className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div className="grid min-w-0 flex-1">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {handle} · {time}
          </span>
        </div>
      </header>
      <div className="mt-3 text-[15px] leading-relaxed">{children}</div>
      {media && <div className="mt-3 overflow-hidden rounded-xl border">{media}</div>}
      <footer className="-ml-2 mt-3 flex items-center gap-1">
        <button type="button" className={cn(act, "hover:bg-accent hover:text-foreground")} aria-label="Reply">
          <MessageCircle className="size-4" /> {fmt(replies)}
        </button>
        <button
          type="button"
          aria-pressed={reposted}
          onClick={() => setReposted(!reposted)}
          className={cn(act, reposted ? "text-success" : "hover:bg-success/10 hover:text-success")}
          aria-label="Repost"
        >
          <Repeat2 className="size-4" /> {fmt(reposts + (reposted ? 1 : 0))}
        </button>
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
          className={cn(act, liked ? "text-rose-500" : "hover:bg-rose-500/10 hover:text-rose-500")}
          aria-label="Like"
        >
          <Heart className={cn("size-4 transition-transform", liked && "scale-110 fill-current")} /> {fmt(likes + (liked ? 1 : 0))}
        </button>
        <button type="button" className={cn(act, "ml-auto hover:bg-accent hover:text-foreground")} aria-label="Share">
          <Share className="size-4" />
        </button>
      </footer>
    </article>
  );
}
