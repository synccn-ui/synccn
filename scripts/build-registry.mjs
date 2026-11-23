// Builds the shadcn-compatible registry into public/r:
//
//   public/r/registry.json   index of every item (no file contents), for the shadcn directory
//   public/r/<name>.json     one item each, with file contents, for `npx shadcn add`
//
// Items:
//   base            CSS the components rely on (tokens, animations, utilities) + cn()
//   hooks           lib/hooks.ts, shared by the interactive components
//   clipboard       lib/clipboard.ts, used by Copy Button and Code Block
//   <component>     one per component, installed to components/ui
//   <component>-demo  the example shown on the site, installed to components
//   <block>         full-page blocks, installed to components
//
// Dependencies are read from each file's imports, so they can't drift from the code.
// SYNCCN_REGISTRY_URL sets the address used for links between items (default https://synccn.com/r).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "ts5";
import { createHash } from "node:crypto";
import { changesFor } from "../src/registry/changelog.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.env.SYNCCN_REGISTRY_URL || "https://synccn.com/r").replace(/\/$/, "");
const HOMEPAGE = "https://synccn.com";
const out = path.join(root, "public/r");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

/* ---------- Metadata from the site's own registry ---------- */

const evalArray = (src, start) => {
  const from = src.indexOf(start);
  const body = src.slice(src.indexOf("[", from), src.indexOf("\n];", from) + 2);
  return new Function(`return ${body}`)();
};
const entries = evalArray(read("src/registry/index.js"), "const entries = [");
const blocksMeta = evalArray(read("src/blocks/index.js"), "const meta = [");

/* ---------- Import analysis ---------- */

const IGNORE_NPM = new Set(["react", "react-dom"]);
const importsOf = (code) => ts.preProcessFile(code, true, true).importedFiles.map((f) => f.fileName);
const npmName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

// A shared file (kbd.tsx holds Kbd and Separator) is owned by the entry named after it.
const ownerOfFile = {};
for (const e of entries) if (!ownerOfFile[e.file] || e.slug === e.file) ownerOfFile[e.file] = e.slug;

const url = (name) => `${BASE}/${name}.json`;

function analyse(code, self) {
  const npm = new Set();
  const reg = new Set([url("base")]);
  for (const spec of importsOf(code)) {
    if (spec === "@/lib/hooks") reg.add(url("hooks"));
    else if (spec === "@/lib/clipboard") reg.add(url("clipboard"));
    else if (spec === "@/lib/utils") continue; // provided by base
    else if (spec.startsWith("@/registry/ui/")) {
      const owner = ownerOfFile[spec.slice("@/registry/ui/".length)];
      if (!owner) throw new Error(`${self}: no registry entry for ${spec}`);
      if (owner !== self) reg.add(url(owner));
    } else if (spec.startsWith("@/") || spec.startsWith(".")) throw new Error(`${self}: unexpected import ${spec}`);
    else if (!IGNORE_NPM.has(npmName(spec))) npm.add(npmName(spec));
  }
  return { dependencies: [...npm].sort(), registryDependencies: [...reg] };
}

// What users get: the same import paths the site shows on each component page.
const userCode = (code) => code.replaceAll("@/registry/ui/", "@/components/ui/");

/* ---------- Items ---------- */

const items = [];
const add = (item) => {
  if (items.some((i) => i.name === item.name)) throw new Error(`duplicate item ${item.name}`);
  items.push(item);
};

// base: everything in the stylesheet that components depend on beyond a stock shadcn theme.
add({
  name: "base",
  type: "registry:item",
  title: "synccn base",
  description: "Design tokens, animations and utility classes used across synccn components, plus cn().",
  dependencies: ["clsx", "tailwind-merge"],
  registryDependencies: ["utils"],
  cssVars: {
    theme: {
      "color-success": "var(--success)",
      "color-warning": "var(--warning)",
      "color-brand-soft": "var(--brand-soft)",
      "animate-marquee": "marquee var(--duration, 30s) linear infinite",
      "animate-marquee-y": "marquee-y var(--duration, 30s) linear infinite",
      "animate-shimmer": "shimmer 2.4s linear infinite",
      "animate-beam": "beam calc(var(--beam-duration, 6) * 1s) linear infinite",
      "animate-orbit": "orbit calc(var(--orbit-duration, 20) * 1s) linear infinite",
      "animate-meteor": "meteor 5s linear infinite",
      "animate-in": "enter 0.18s ease-out",
      "animate-out": "exit 0.15s ease-in forwards",
      "animate-sheet-right": "sheet-right 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
      "animate-sheet-left": "sheet-left 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
      "animate-sheet-bottom": "sheet-bottom 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      "animate-fade": "fade 0.2s ease-out",
      "animate-blink": "blink 1s step-end infinite",
      "animate-ripple": "ripple 0.6s ease-out forwards",
      "animate-pulse-ring": "pulse-ring 2s ease-out infinite",
    },
    light: {
      success: "oklch(0.62 0.15 155)",
      warning: "oklch(0.76 0.16 75)",
      "brand-soft": "oklch(0.205 0 0 / 0.06)",
    },
    dark: {
      success: "oklch(0.72 0.16 155)",
      warning: "oklch(0.8 0.15 80)",
      "brand-soft": "oklch(1 0 0 / 0.08)",
    },
  },
  css: {
    "@keyframes marquee": { from: { transform: "translateX(0)" }, to: { transform: "translateX(calc(-100% - var(--gap)))" } },
    "@keyframes marquee-y": { from: { transform: "translateY(0)" }, to: { transform: "translateY(calc(-100% - var(--gap)))" } },
    "@keyframes shimmer": { from: { "background-position": "200% 0" }, to: { "background-position": "-200% 0" } },
    "@keyframes beam": { to: { "offset-distance": "100%" } },
    "@keyframes orbit": {
      from: { transform: "rotate(0deg) translateY(calc(var(--orbit-radius) * 1px)) rotate(0deg)" },
      to: { transform: "rotate(360deg) translateY(calc(var(--orbit-radius) * 1px)) rotate(-360deg)" },
    },
    "@keyframes meteor": {
      "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
      "70%": { opacity: "1" },
      "100%": { transform: "rotate(215deg) translateX(-600px)", opacity: "0" },
    },
    "@keyframes enter": { from: { opacity: "0", transform: "translateY(4px) scale(0.98)" }, to: { opacity: "1", transform: "none" } },
    "@keyframes exit": { to: { opacity: "0", transform: "translateY(4px) scale(0.98)" } },
    "@keyframes sheet-right": { from: { transform: "translateX(100%)" } },
    "@keyframes sheet-left": { from: { transform: "translateX(-100%)" } },
    "@keyframes sheet-bottom": { from: { transform: "translateY(100%)" } },
    "@keyframes indeterminate": { from: { left: "-35%" }, to: { left: "100%" } },
    "@keyframes fade": { from: { opacity: "0" } },
    "@keyframes blink": { "50%": { opacity: "0" } },
    "@keyframes ripple": { from: { transform: "scale(0)", opacity: "0.35" }, to: { transform: "scale(4)", opacity: "0" } },
    "@keyframes pulse-ring": {
      "0%": { "box-shadow": "0 0 0 0 var(--brand-soft)" },
      "70%": { "box-shadow": "0 0 0 10px transparent" },
      "100%": { "box-shadow": "0 0 0 0 transparent" },
    },
    "@utility surface": {
      background: "var(--card)",
      "&:where(.dark, .dark *)": { "box-shadow": "inset 0 1px 0 0 oklch(1 0 0 / 0.05)" },
    },
    "@utility scrollbar-none": { "scrollbar-width": "none", "&::-webkit-scrollbar": { display: "none" } },
    "@utility scrollbar-thin": { "scrollbar-width": "thin", "scrollbar-color": "var(--border) transparent" },
    "@utility bg-grid": {
      "background-image": "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
      "background-size": "32px 32px",
    },
    "@utility bg-dots": { "background-image": "radial-gradient(var(--border) 1px, transparent 1px)", "background-size": "18px 18px" },
    "@utility text-fade": {
      "background-image": "linear-gradient(to bottom, var(--foreground) 30%, color-mix(in srgb, var(--foreground) 58%, transparent))",
      "-webkit-background-clip": "text",
      "background-clip": "text",
      color: "transparent",
    },
  },
});

for (const lib of ["hooks", "clipboard"]) {
  const file = `src/lib/${lib}.ts`;
  const code = read(file);
  const deps = analyse(code, lib);
  add({
    name: lib,
    type: "registry:lib",
    title: lib === "hooks" ? "Hooks" : "Clipboard",
    description: lib === "hooks" ? "Small hooks shared by the interactive synccn components." : "copyText(), with a fallback where the Clipboard API is blocked.",
    dependencies: deps.dependencies,
    files: [{ path: `registry/synccn/lib/${lib}.ts`, type: "registry:lib", content: code }],
  });
}

for (const e of entries) {
  const code = read(`src/registry/ui/${e.file}.tsx`);
  const deps = analyse(code, e.slug);
  add({
    name: e.slug,
    type: "registry:ui",
    title: e.name,
    description: e.description,
    categories: [e.category],
    ...deps,
    files: [{ path: `registry/synccn/ui/${e.file}.tsx`, type: "registry:ui", content: userCode(code) }],
  });
}

for (const e of entries) {
  const code = read(`src/registry/demos/${e.slug}.tsx`);
  const deps = analyse(code, `${e.slug}-demo`);
  add({
    name: `${e.slug}-demo`,
    type: "registry:component",
    title: `${e.name} demo`,
    description: `The ${e.name} example from synccn.com.`,
    categories: [e.category, "examples"],
    ...deps,
    files: [{ path: `registry/synccn/examples/${e.slug}-demo.tsx`, type: "registry:component", content: userCode(code) }],
  });
}

for (const b of blocksMeta) {
  const code = read(`src/blocks/${b.slug}.tsx`);
  const deps = analyse(code, b.slug);
  add({
    name: b.slug,
    type: "registry:block",
    title: b.name,
    description: b.description,
    categories: ["blocks"],
    ...deps,
    files: [{ path: `registry/synccn/blocks/${b.slug}.tsx`, type: "registry:component", content: userCode(code) }],
  });
}

/* ---------- Write ---------- */

const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";
const SCHEMA_REGISTRY = "https://ui.shadcn.com/schema/registry.json";
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => !(Array.isArray(v) && v.length === 0)));

// Versions: a hash of what gets installed, so it changes exactly when an item does.
// `synccn status` compares it with the version recorded at install time.
for (const item of items) {
  const h = createHash("sha256");
  for (const f of item.files ?? []) h.update(f.path).update("\0").update(f.content ?? "");
  h.update(JSON.stringify([item.dependencies ?? [], (item.registryDependencies ?? []).map((d) => d.split("/").pop()), item.cssVars ?? {}, item.css ?? {}]));
  item.meta = { version: h.digest("hex").slice(0, 10), changes: changesFor(item.name) };
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const item of items) {
  fs.writeFileSync(path.join(out, `${item.name}.json`), JSON.stringify({ $schema: SCHEMA_ITEM, ...clean(item) }, null, 2) + "\n");
}
const index = {
  $schema: SCHEMA_REGISTRY,
  name: "synccn",
  homepage: HOMEPAGE,
  items: items.map((item) => clean({ ...item, files: item.files?.map(({ content, ...f }) => f) })),
};
fs.writeFileSync(path.join(out, "registry.json"), JSON.stringify(index, null, 2) + "\n");
// Dependency map for the component pages: what each component imports, from where, and
// what imports it. Named imports say *why* a dependency is there.
function namedImports(code) {
  const sf = ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  const out = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || st.importClause?.isTypeOnly) continue;
    const names = [];
    const c = st.importClause;
    if (c?.name) names.push(c.name.text);
    if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) {
      for (const el of c.namedBindings.elements) if (!el.isTypeOnly) names.push((el.propertyName ?? el.name).text);
    }
    out.push({ from: st.moduleSpecifier.text, names });
  }
  return out;
}
const depMap = {};
for (const e of entries) {
  const code = read(`src/registry/ui/${e.file}.tsx`);
  const d = { components: [], helpers: [], packages: [], usedBy: [] };
  for (const { from, names } of namedImports(code)) {
    if (from.startsWith("@/registry/ui/")) {
      const owner = ownerOfFile[from.slice(14)];
      if (owner !== e.slug && owner) d.components.push({ slug: owner, names });
    } else if (from.startsWith("@/lib/")) d.helpers.push({ file: `lib/${from.slice(6)}`, names });
    else if (!IGNORE_NPM.has(npmName(from))) d.packages.push({ name: npmName(from), names });
  }
  depMap[e.slug] = d;
}
for (const [slug, d] of Object.entries(depMap)) for (const c of d.components) depMap[c.slug]?.usedBy.push(slug);
for (const d of Object.values(depMap)) d.blocks = [];
for (const b of blocksMeta) {
  const owners = new Set(namedImports(read(`src/blocks/${b.slug}.tsx`)).filter((i) => i.from.startsWith("@/registry/ui/")).map((i) => ownerOfFile[i.from.slice(14)]));
  for (const o of owners) depMap[o]?.blocks.push(b.slug);
}
fs.mkdirSync(path.join(root, "src/registry/__generated__"), { recursive: true });
fs.writeFileSync(path.join(root, "src/registry/__generated__/deps.json"), JSON.stringify(depMap) + "\n");

// Accessibility facts read straight from each component's source, for its page.
// Only what the code demonstrably does: roles, ARIA, keys handled, motion and focus.
const HOOK_FACTS = {
  useFocusTrap: "Keeps keyboard focus inside while open, and returns it when closed",
  useEscape: "Closes with Escape",
  useLockScroll: "Stops the page behind from scrolling while open",
  useClickOutside: "Closes when you click or tap outside",
  useAutoSide: "Flips to whichever side has room, so it stays on screen",
};
const KEY_NAMES = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Enter", "Escape", "Tab", "Backspace", "Delete", " "];
const a11y = {};
for (const e of entries) {
  const code = read(`src/registry/ui/${e.file}.tsx`);
  const roles = [...new Set([...code.matchAll(/role=["{]["']?([a-z]+)/g)].map((m) => m[1]))].sort();
  const aria = [...new Set([...code.matchAll(/\b(aria-[a-z]+)=/g)].map((m) => m[1]))].sort();
  const keys = KEY_NAMES.filter((k) => {
    const q = k === " " ? " " : k;
    // e.key === "X", e.key !== "X", case "X":, ["X", …] lists, and { X: handler } maps.
    return new RegExp(`(?:key\\s*[!=]==?\\s*|case\\s*|\\[\\s*|,\\s*)["']${q}["']`).test(code) || (k !== " " && new RegExp(`[{,]\\s*["']?${k}["']?\\s*:`).test(code));
  }).map((k) => (k === " " ? "Space" : k));
  const facts = [];
  if (roles.length) facts.push(`ARIA roles: ${roles.join(", ")}`);
  if (aria.length) facts.push(`ARIA attributes: ${aria.join(", ")}`);
  if (keys.length) facts.push(`Keys handled: ${keys.join(", ")}`);
  for (const [hook, text] of Object.entries(HOOK_FACTS)) if (new RegExp(`\\b${hook}\\(`).test(code)) facts.push(text);
  if (/prefers-reduced-motion|motion-reduce:|motion-safe:/.test(code)) facts.push("Respects the reduced motion setting");
  if (/focus-visible:/.test(code)) facts.push("Shows a visible focus ring for keyboard users");
  if (/sr-only/.test(code)) facts.push("Includes text only screen readers hear");
  if (/<label\b|htmlFor=/.test(code)) facts.push("Labels are tied to their controls");
  if (/aria-live|role="status"|role="alert"/.test(code)) facts.push("Announces changes to screen readers");
  a11y[e.slug] = facts;
}
fs.writeFileSync(path.join(root, "src/registry/__generated__/a11y.json"), JSON.stringify(a11y) + "\n");

// The same styles as plain CSS, for the manual install instructions on the site.
const base = items.find((i) => i.name === "base");
const block = (sel, obj, pad = "") =>
  `${pad}${sel} {\n` +
  Object.entries(obj)
    .map(([k, v]) => (typeof v === "object" ? block(k, v, pad + "  ") : `${pad}  ${k}: ${v};`))
    .join("\n") +
  `\n${pad}}`;
const vars = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [`--${k}`, v]));
const css = [
  "/* synccn styles: add below your theme variables */",
  block(":root", vars(base.cssVars.light)),
  block(".dark", vars(base.cssVars.dark)),
  block("@theme inline", vars(base.cssVars.theme)),
  ...Object.entries(base.css).map(([sel, body]) => block(sel, body)),
].join("\n\n");
const gen = path.join(root, "src/registry/__generated__");
fs.mkdirSync(gen, { recursive: true });
fs.writeFileSync(path.join(gen, "base.css.txt"), css + "\n");

console.log(`build-registry: wrote ${items.length} items to public/r (${BASE})`);
