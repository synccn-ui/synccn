/**
 * Release notes. Each change names the registry items it touches; those items carry the
 * note in their `meta.changes`, which `synccn update` shows before merging.
 * Mark a change `breaking` when code using the component has to change.
 */
export const releases = [
  {
    date: "2026-11-23",
    title: "Signature components, app blocks and synccn sync",
    changes: [
      { items: ["data-view", "filter-builder", "activity-timeline", "command-center", "inspector-drawer", "permissions-matrix", "async-state"], summary: "New component." },
      { items: ["analytics", "developer-platform", "saas-admin"], summary: "New block." },
      { items: ["calendar", "date-picker", "countdown", "heatmap", "week-schedule"], summary: "Read the current time after the page loads, so Next.js can prerender pages that use them." },
      { items: ["hooks"], summary: "Added useNow(), the current time in the browser only." },
      { items: ["checkbox"], summary: "Takes aria-label for checkboxes with no visible label." },
      { items: ["stat-card"], summary: "New changeLabel and goodWhen props for the comparison line." },
      { items: ["copy-button", "code-block", "clipboard"], summary: "copyText moved from lib/utils to lib/clipboard, so lib/utils matches shadcn's exactly. Manual installs: update the import.", breaking: true },
    ],
  },
  {
    date: "2026-11-22",
    title: "TypeScript, Next.js and the shadcn registry",
    changes: [
      { items: ["*"], summary: "Every component is written in strict TypeScript, with a JavaScript version generated from it." },
      { items: ["*"], summary: "Installable with the shadcn CLI from the @synccn registry." },
    ],
  },
];

/** Changes that mention an item, newest first. "*" means every item. */
export const changesFor = (name) => releases.flatMap((r) => r.changes.filter((c) => c.items.includes(name) || c.items.includes("*")).map((c) => ({ date: r.date, summary: c.summary, ...(c.breaking ? { breaking: true } : {}) })));
