"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/hooks";
import { EventCalendar, type CalendarEvent } from "@/registry/ui/event-calendar";

export default function EventCalendarDemo() {
  // Events are placed around today, which the browser fills in after loading.
  const now = useNow();
  const [picked, setPicked] = useState<string | null>(null);
  const events = useMemo<CalendarEvent[]>(() => {
    if (!now) return [];
    const at = (dayOffset: number, h: number, m = 0) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, m);
    return [
      { id: "1", title: "Design review", start: at(0, 10), end: at(0, 11), color: "violet" },
      { id: "2", title: "Ship v2.4", start: at(0, 15, 30), color: "green" },
      { id: "3", title: "1:1 with synccn", start: at(0, 17), color: "blue" },
      { id: "4", title: "Offsite", start: at(2, 0), end: at(4, 0), allDay: true, color: "amber" },
      { id: "5", title: "Sprint planning", start: at(-3, 9, 30), color: "blue" },
      { id: "6", title: "Incident retro", start: at(-6, 14), color: "red" },
      { id: "7", title: "Customer call", start: at(7, 11), color: "default" },
      { id: "8", title: "Launch day", start: at(9, 0), allDay: true, color: "green" },
    ];
  }, [now]);

  return (
    <div className="grid w-full max-w-3xl gap-2">
      <EventCalendar events={events} onEventClick={(e) => setPicked(e.title)} />
      <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
        {picked ? `Opened "${picked}"` : "Arrow keys move between days; Page Up and Page Down change month."}
      </p>
    </div>
  );
}
