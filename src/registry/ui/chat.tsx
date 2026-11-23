import type * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/registry/ui/avatar";

export interface ChatBubbleProps {
  /** Which side the bubble sits on. */
  from?: "me" | "them";
  /** Sender name, used for the avatar. */
  name?: string;
  /** Time under the bubble. */
  time?: string;
  /** Hide for consecutive messages from the same sender. */
  showAvatar?: boolean;
  /** Delivery status, e.g. Read. */
  status?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Message bubble. Consecutive messages from the same sender hide the repeated avatar. */
export function ChatBubble({ from = "them", name, time, children, showAvatar = true, status }: ChatBubbleProps) {
  const me = from === "me";
  return (
    <div className={cn("flex items-end gap-2", me && "flex-row-reverse")}>
      <span className="w-8 shrink-0">{showAvatar && !me && name && <Avatar name={name} size="sm" />}</span>
      <div className={cn("grid max-w-[78%] gap-1", me && "justify-items-end")}>
        <div
          className={cn(
            "animate-in rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            me ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground"
          )}
        >
          {children}
        </div>
        {(time || status) && (
          <span className="px-1 text-[11px] text-muted-foreground">
            {time}
            {status && ` · ${status}`}
          </span>
        )}
      </div>
    </div>
  );
}

export interface TypingIndicatorProps {
  /** Who is typing. */
  name?: string;
}

/** Three bouncing dots shown while the other person is typing. */
export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2">
      <span className="w-8 shrink-0">{name && <Avatar name={name} size="sm" />}</span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3" aria-label={`${name || "Someone"} is typing`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
