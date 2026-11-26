"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

/** True while the browser has a network connection. Always true while server rendering. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
}

export interface NetworkStatusProps {
  /** Overrides the detected state, e.g. for testing or when you check your own API's health. */
  online?: boolean;
  /**
   * "fixed" floats at the bottom of the window; "inline" sits where you put it.
   * @default "fixed"
   */
  position?: "fixed" | "inline";
  /**
   * Message while offline.
   * @default "You're offline. Changes will sync when you reconnect."
   */
  offlineMessage?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Tells people when they lose their connection, and briefly when it's back. Nothing shows
 * while everything is fine. Also exports useOnline() for your own logic.
 */
export function NetworkStatus({ online: forced, position = "fixed", offlineMessage = "You're offline. Changes will sync when you reconnect.", className }: NetworkStatusProps) {
  const detected = useOnline();
  const online = forced ?? detected;
  const [back, setBack] = useState(false);
  const was = useRef(online);
  useEffect(() => {
    if (!was.current && online) {
      setBack(true);
      const t = setTimeout(() => setBack(false), 3000);
      was.current = online;
      return () => clearTimeout(t);
    }
    was.current = online;
    if (!online) setBack(false);
  }, [online]);

  const show = !online || back;
  return (
    <div role="status" aria-live="polite" className={cn(position === "fixed" ? "fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" : "flex justify-center", !show && "pointer-events-none", className)}>
      {show && (
        <div className={cn("flex animate-in items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] font-medium shadow-lg", online ? "border-success/30 bg-popover text-foreground" : "border-transparent bg-foreground text-background")}>
          {online ? <Wifi className="size-4 text-success" aria-hidden /> : <WifiOff className="size-4" aria-hidden />}
          {online ? "Back online" : offlineMessage}
        </div>
      )}
    </div>
  );
}
