// Checks the generated registry in public/r before it ships. Fails (exit 1) on:
//   - any file that doesn't match shadcn's registry or registry-item schema
//   - file contents in registry.json (the shadcn directory forbids them)
//   - a registryDependency that points at an item that doesn't exist
//   - an npm dependency the site itself doesn't install (so its version is untested)
//   - an animate-* class used by a component that neither Tailwind nor the base item defines
// Run after build-registry: `npm run test:registry` (also part of every build).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registryItemSchema, registrySchema } from "shadcn/schema";
import { releases } from "../src/registry/changelog.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/r");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const installed = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const items = new Map();
for (const f of files) {
  const json = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const res = (f === "registry.json" ? registrySchema : registryItemSchema).safeParse(json);
  if (!res.success) fail(f, res.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; "));
  if (f === "registry.json") {
    if (json.items.some((i) => i.files?.some((x) => "content" in x))) fail(f, "index must not include file contents");
  } else items.set(json.name, json);
}

const index = JSON.parse(fs.readFileSync(path.join(dir, "registry.json"), "utf8"));
for (const i of index.items) if (!items.has(i.name)) fail("registry.json", `lists ${i.name} but ${i.name}.json is missing`);

const BUILTIN_ANIMATIONS = new Set(["spin", "ping", "pulse", "bounce", "none"]);
const defined = new Set(Object.keys(items.get("base")?.cssVars?.theme ?? {}).filter((k) => k.startsWith("animate-")).map((k) => k.slice(8)));

for (const [name, item] of items) {
  if (!/^[0-9a-f]{10}$/.test(item.meta?.version ?? "")) fail(`${name}.json`, "has no meta.version (synccn status needs it)");
  for (const dep of item.registryDependencies ?? []) {
    if (dep === "utils") continue;
    const target = dep.split("/").pop().replace(/\.json$/, "");
    if (!items.has(target)) fail(`${name}.json`, `depends on ${dep}, which doesn't exist`);
  }
  for (const dep of item.dependencies ?? []) if (!installed.has(dep)) fail(`${name}.json`, `needs ${dep}, which the site doesn't install`);
  for (const file of item.files ?? []) {
    if (!file.content?.trim()) fail(`${name}.json`, `${file.path} is empty`);
    for (const m of file.content.matchAll(/\banimate-([a-z][a-z-]*)/g)) {
      if (!BUILTIN_ANIMATIONS.has(m[1]) && !defined.has(m[1])) fail(`${name}.json`, `uses animate-${m[1]}, which nothing defines`);
    }
  }
}

for (const r of releases) for (const ch of r.changes) for (const n of ch.items) if (n !== "*" && !items.has(n)) fail("changelog.js", `${r.date} mentions ${n}, which isn't a registry item`);

if (problems.length) {
  console.error(`check-registry: ${problems.length} problem(s)\n  ${[...new Set(problems)].join("\n  ")}`);
  process.exit(1);
}
console.log(`check-registry: ${items.size} items and the index are valid`);
