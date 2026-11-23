import { Suspense, createElement, lazy } from "react";

// Blocks load the first time they're shown.
const mods = import.meta.glob("./*.tsx");
const lazyBlock = (load) => {
  const Lazy = lazy(load);
  return function Block(props) {
    return createElement(Suspense, { fallback: createElement("div", { className: "h-96 w-full max-w-6xl animate-pulse rounded-2xl border bg-muted/30", "aria-label": "Loading block" }) }, createElement(Lazy, props));
  };
};
const raws = import.meta.glob("./*.tsx", { query: "?raw", import: "default" });
const rawsJs = import.meta.glob("../registry/__generated__/js/blocks/*.jsx", { query: "?raw", import: "default" });

const meta = [
  { slug: "analytics", name: "Analytics", description: "Traffic and conversion with period comparison, KPIs, channels, devices and a sortable top-pages table.", height: 1180 },
  { slug: "developer-platform", name: "Developer platform", description: "Deployments with an inspector, uptime, API keys created once and revocable, filterable logs and environment variables.", height: 1060 },
  { slug: "saas-admin", name: "SaaS admin", description: "Members with filters, bulk role changes and invites, a permissions matrix, an activity log and organization settings.", height: 900 },
  { slug: "dashboard", name: "Dashboard", description: "Sidebar, KPI tiles, a sales chart with a range switch and recent orders.", height: 640 },
  { slug: "sign-in", name: "Sign in", description: "Social and password sign-in with validation, show-password and a brand panel.", height: 600 },
  { slug: "pricing", name: "Pricing", description: "Three tiers with a monthly or yearly switch and a highlighted plan.", height: 620 },
  { slug: "settings", name: "Settings", description: "Tabbed profile, notification and appearance settings with unsaved-changes state.", height: 620 },
  { slug: "team", name: "Team members", description: "Invite by email, change roles from a menu and remove with undo.", height: 520 },
];

export const blocks = meta.map((m) => ({
  ...m,
  Block: lazyBlock(mods[`./${m.slug}.tsx`]),
  loadCode: async () => ({ ts: await raws[`./${m.slug}.tsx`](), js: await rawsJs[`../registry/__generated__/js/blocks/${m.slug}.jsx`]() }),
}));
