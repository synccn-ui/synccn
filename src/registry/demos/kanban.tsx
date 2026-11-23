import { Kanban } from "@/registry/ui/kanban";

export default function KanbanDemo() {
  return (
    <Kanban
      className="max-w-3xl"
      columns={[
        {
          id: "todo",
          title: "To do",
          cards: [
            { id: "1", title: "Write migration guide for v3", tag: "Docs" },
            { id: "2", title: "Audit focus styles in overlays", tag: "A11y" },
          ],
        },
        {
          id: "doing",
          title: "In progress",
          cards: [
            { id: "3", title: "Range mode for Calendar", tag: "Feature" },
            { id: "4", title: "Toast stacking on mobile" },
          ],
        },
        { id: "done", title: "Done", cards: [{ id: "5", title: "Theme export to CSS", tag: "Feature" }] },
      ]}
    />
  );
}
