"use client";

import { WeekSchedule } from "@/registry/ui/week-schedule";
import { toast } from "@/registry/ui/toast";

export default function WeekScheduleDemo() {
  return (
    <WeekSchedule
      className="max-w-3xl"
      startHour={8}
      endHour={17}
      onEventClick={(e) => toast(e.title)}
      events={[
        { day: 0, start: 9, end: 10, title: "Standup", tone: "blue" },
        { day: 0, start: 13, end: 15, title: "Design review", tone: "violet" },
        { day: 1, start: 10, end: 11.5, title: "1:1 with synccn", tone: "green" },
        { day: 2, start: 9, end: 10, title: "Standup", tone: "blue" },
        { day: 2, start: 11, end: 13, title: "Deep work", tone: "amber" },
        { day: 3, start: 14, end: 16, title: "Sprint planning", tone: "rose" },
        { day: 4, start: 9, end: 10, title: "Standup", tone: "blue" },
        { day: 4, start: 15, end: 16.5, title: "Demo day", tone: "violet" },
      ]}
    />
  );
}
