"use client";

import { useMemo, useState } from "react";
import { CalendarDays, KanbanSquare, List, Plus } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { Avatar, AvatarGroup } from "@/registry/ui/avatar";
import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { Dialog } from "@/registry/ui/dialog";
import { EventCalendar, type CalendarEvent } from "@/registry/ui/event-calendar";
import { Input } from "@/registry/ui/input";
import { InspectorDrawer, InspectorProperties } from "@/registry/ui/inspector-drawer";
import { Kanban, type KanbanColumn } from "@/registry/ui/kanban";
import { MentionInput, type MentionPerson } from "@/registry/ui/mention-input";
import { Select } from "@/registry/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";
import { toast } from "@/registry/ui/toast";

type Status = "todo" | "doing" | "done";
type Priority = "Low" | "Medium" | "High";
interface Task {
  id: string;
  title: string;
  status: Status;
  assignee: string;
  priority: Priority;
  due: number;
  comments: { who: string; text: string }[];
}

const STATUS: Record<Status, string> = { todo: "To do", doing: "In progress", done: "Done" };
const PRIORITY_TONE: Record<Priority, BadgeVariant> = { Low: "secondary", Medium: "soft", High: "destructive" };
const PEOPLE: MentionPerson[] = [
  { id: "synccn", name: "synccn" },
];

const SEED: Task[] = [
  { id: "t1", title: "Audit current site analytics", status: "done", assignee: "synccn", priority: "Medium", due: -6, comments: [] },
  { id: "t2", title: "New homepage hero", status: "doing", assignee: "synccn", priority: "High", due: 1, comments: [{ who: "synccn", text: "Can we try the version with the product shot?" }] },
  { id: "t3", title: "Migrate blog to MDX", status: "doing", assignee: "synccn", priority: "Medium", due: 3, comments: [] },
  { id: "t4", title: "Pricing page copy", status: "todo", assignee: "synccn", priority: "High", due: 4, comments: [] },
  { id: "t5", title: "Redirects for old URLs", status: "todo", assignee: "synccn", priority: "Low", due: 8, comments: [] },
  { id: "t6", title: "Launch checklist", status: "todo", assignee: "synccn", priority: "Medium", due: 11, comments: [] },
];

export default function ProjectManagementBlock() {
  const now = useNow();
  const [tasks, setTasks] = useState(SEED);
  const [boardKey, setBoardKey] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", assignee: "synccn", priority: "Medium" as Priority });
  const [comment, setComment] = useState("");

  const dayStart = now ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() : null;
  const dueDate = (t: Task) => (dayStart === null ? null : new Date(dayStart + t.due * 86_400_000 + 17 * 3_600_000));
  const dueLabel = (t: Task) => {
    const d = dueDate(t);
    if (!d) return "—";
    if (t.due === 0) return "Today";
    if (t.due === 1) return "Tomorrow";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const columns: KanbanColumn[] = (Object.keys(STATUS) as Status[]).map((s) => ({
    id: s,
    title: STATUS[s],
    cards: tasks.filter((t) => t.status === s).map((t) => ({ id: t.id, title: t.title, tag: t.priority === "High" ? "High priority" : undefined })),
  }));

  const events = useMemo<CalendarEvent[]>(
    () => (dayStart === null ? [] : tasks.map((t) => ({ id: t.id, title: t.title, start: dayStart + t.due * 86_400_000, allDay: true, color: t.status === "done" ? "green" : t.priority === "High" ? "red" : "blue" }))),
    [tasks, dayStart]
  );

  const done = tasks.filter((t) => t.status === "done").length;
  const open = tasks.find((t) => t.id === openId) ?? null;

  const addTask = () => {
    if (!draft.title.trim()) return;
    setTasks((ts) => [...ts, { id: `t${Date.now()}`, title: draft.title.trim(), status: "todo", assignee: draft.assignee, priority: draft.priority, due: 7, comments: [] }]);
    setBoardKey((k) => k + 1);
    setNewOpen(false);
    setDraft({ title: "", assignee: "synccn", priority: "Medium" });
    toast.success("Task added", { description: draft.title.trim() });
  };

  return (
    <div className="grid w-full max-w-6xl gap-5 rounded-2xl border bg-background p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Marketing · Q4</p>
          <h2 className="text-lg font-semibold tracking-tight">Website relaunch</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="grid gap-1">
            <p className="text-xs tabular-nums text-muted-foreground">
              {done} of {tasks.length} done
            </p>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Project progress" aria-valuenow={done} aria-valuemin={0} aria-valuemax={tasks.length}>
              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(done / tasks.length) * 100}%` }} />
            </div>
          </div>
          <AvatarGroup people={PEOPLE.map((p) => ({ name: p.name }))} size="sm" />
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <Plus /> New task
          </Button>
        </div>
      </header>

      <Tabs defaultValue="board" variant="underline">
        <TabsList>
          <TabsTrigger value="board">
            <KanbanSquare className="size-4" /> Board
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="size-4" /> List
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="size-4" /> Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="pt-4">
          <Kanban
            key={boardKey}
            columns={columns}
            onChange={(cols) => {
              const where = new Map(cols.flatMap((c) => c.cards.map((card) => [card.id, c.id as Status] as const)));
              setTasks((ts) => ts.map((t) => (where.has(t.id) ? { ...t, status: where.get(t.id) ?? t.status } : t)));
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">Drag cards between columns. Open a task from the List tab to edit it and comment.</p>
        </TabsContent>

        <TabsContent value="list" className="pt-4">
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="pr-4 text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => setOpenId(t.id)}>
                    <TableCell className="pl-4">
                      <button type="button" className="text-left font-medium hover:underline" onClick={(e) => (e.stopPropagation(), setOpenId(t.id))}>
                        {t.title}
                      </button>
                      {t.comments.length > 0 && <span className="ml-2 text-xs text-muted-foreground">{t.comments.length} comment{t.comments.length > 1 ? "s" : ""}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === "done" ? "success" : t.status === "doing" ? "warning" : "outline"} dot>
                        {STATUS[t.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <Avatar name={t.assignee} size="xs" /> {t.assignee}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-4 text-right tabular-nums text-muted-foreground">{dueLabel(t)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="pt-4">
          <EventCalendar events={events} onEventClick={(e) => setOpenId(e.id)} maxPerDay={2} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={newOpen}
        onOpenChange={setNewOpen}
        title="New task"
        footer={
          <>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!draft.title.trim()} onClick={addTask}>
              Add task
            </Button>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), addTask())}>
          <label className="grid gap-1.5 text-sm">
            Title
            <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="What needs doing?" autoFocus />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 text-sm">
              Assignee
              <Select aria-label="Assignee" value={draft.assignee} onValueChange={(v) => setDraft((d) => ({ ...d, assignee: v }))} options={PEOPLE.map((p) => ({ value: p.name, label: p.name }))} />
            </div>
            <div className="grid gap-1.5 text-sm">
              Priority
              <Select aria-label="Priority" value={draft.priority} onValueChange={(v) => setDraft((d) => ({ ...d, priority: v as Priority }))} options={["Low", "Medium", "High"].map((v) => ({ value: v, label: v }))} />
            </div>
          </div>
        </form>
      </Dialog>

      {open && (
        <InspectorDrawer
          open={!!open}
          onOpenChange={(o) => !o && setOpenId(null)}
          title={open.title}
          subtitle={`${STATUS[open.status]} · due ${dueLabel(open).toLowerCase()}`}
          tabs={[
            {
              value: "details",
              label: "Details",
              content: (
                <InspectorProperties
                  values={{ status: open.status, priority: open.priority, assignee: open.assignee }}
                  fields={[
                    { key: "status", label: "Status", type: "select", options: (Object.keys(STATUS) as Status[]).map((s) => ({ value: s, label: STATUS[s] })) },
                    { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"].map((v) => ({ value: v, label: v })) },
                    { key: "assignee", label: "Assignee", type: "select", options: PEOPLE.map((p) => ({ value: p.name, label: p.name })) },
                  ]}
                  onSave={(v) => {
                    setTasks((ts) => ts.map((t) => (t.id === open.id ? { ...t, ...(v as Partial<Task>) } : t)));
                    setBoardKey((k) => k + 1);
                    toast.success("Task updated");
                  }}
                />
              ),
            },
            {
              value: "comments",
              label: `Comments${open.comments.length ? ` (${open.comments.length})` : ""}`,
              content: (
                <div className="grid gap-4">
                  {open.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                  <ul className="grid gap-3">
                    {open.comments.map((c, i) => (
                      <li key={i} className="flex gap-2.5">
                        <Avatar name={c.who} size="xs" />
                        <div className="grid gap-0.5">
                          <p className="text-xs font-medium">{c.who}</p>
                          <p className="text-sm leading-relaxed">{c.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <MentionInput
                    people={PEOPLE}
                    value={comment}
                    onValueChange={setComment}
                    aria-label="Comment"
                    placeholder="Write a comment, @ to mention"
                    rows={2}
                    onSubmit={(text, mentioned) => {
                      if (!text.trim()) return;
                      setTasks((ts) => ts.map((t) => (t.id === open.id ? { ...t, comments: [...t.comments, { who: "synccn", text: text.trim() }] } : t)));
                      setComment("");
                      if (mentioned.length) toast(`Notified ${mentioned.map((p) => p.name).join(", ")}`);
                    }}
                  />
                  <Button
                    size="sm"
                    className="w-fit"
                    disabled={!comment.trim()}
                    onClick={() => {
                      setTasks((ts) => ts.map((t) => (t.id === open.id ? { ...t, comments: [...t.comments, { who: "synccn", text: comment.trim() }] } : t)));
                      setComment("");
                    }}
                  >
                    Comment
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
