/**
 * Release notes. Each change names the registry items it touches; those items carry the
 * note in their `meta.changes`, which `synccn update` shows before merging.
 * Mark a change `breaking` when code using the component has to change.
 */
export const releases = [
  {
    date: "2026-11-26",
    title: "AI components, developer tools and four new blocks",
    changes: [
      { items: ["ai-message", "streaming-text", "reasoning", "tool-call", "sources", "prompt-suggestions", "model-selector", "agent-plan", "context-meter", "conversation"], summary: "New AI component." },
      { items: ["json-viewer", "log-viewer", "key-value-editor", "command-snippet", "usage-meter", "onboarding-checklist", "event-calendar", "mention-input", "transfer-list", "interactive-grid", "currency-input", "theme-toggle", "shortcut-recorder", "emoji-picker", "image-cropper", "secret-field", "relative-time", "masonry", "tree-view", "virtual-list", "radar-chart", "stacked-bar-chart", "gantt-chart", "popconfirm", "shortcuts-dialog", "action-bar", "wizard", "error-boundary", "network-status", "feedback-widget", "expandable-card", "text-reveal"], summary: "New component." },
      { items: ["ai-chat", "billing", "project-management", "crm"], summary: "New block." },
    ],
  },
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
