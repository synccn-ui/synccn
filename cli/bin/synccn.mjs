#!/usr/bin/env node
// synccn: install synccn components with the shadcn CLI, then keep them current without
// losing your edits. Every update is previewed, merged three ways and backed up first.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createTwoFilesPatch } from "diff";
import { merge } from "node-diff3";
import {
  CliError,
  DEFAULT_REGISTRY,
  abs,
  aliasToDir,
  backup,
  c,
  fetchItem,
  hash,
  installedPackages,
  listBackups,
  loadManifest,
  loadProject,
  normalize,
  packageManager,
  readBase,
  readText,
  registryUrl,
  resolveTree,
  restoreBackup,
  saveManifest,
  synccnDeps,
  targetPath,
  track,
  transform,
} from "../src/core.mjs";

const HELP = `${c.bold("synccn")} keeps synccn components up to date without losing your edits.

${c.bold("Usage")}
  synccn add <names...>      Install with the shadcn CLI and start tracking them
  synccn track <names...>    Start tracking components you already installed
  synccn status              What's changed upstream and what you've changed
  synccn diff <name>         Show upstream changes and your changes, line by line
  synccn update [names...]   Preview, back up, then merge upstream changes into your files
  synccn restore [backup]    List backups, or put one back
  synccn doctor              Check this project's setup

${c.bold("Options")}
  --dry-run     update: show the impact report and stop
  --force       update: also write files that have conflicts, with conflict markers
  --all         update: every tracked component with an update
  --fix         doctor: apply the safe fixes
  --registry    registry URL template (default: components.json, then ${DEFAULT_REGISTRY})
  --cwd         project folder (default: current folder)
`;

/* ---------- args ---------- */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--") && !a.includes("=")));
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.split("=").slice(1).join("=") : i >= 0 ? argv[i + 1] : undefined;
};
const valueFlags = new Set(["--registry", "--cwd"]);
const positional = argv.filter((a, i) => !a.startsWith("--") && !valueFlags.has(argv[i - 1]));
const [command, ...names] = positional;
const cwd = path.resolve(opt("cwd") ?? process.cwd());
const registry = opt("registry");

/* ---------- helpers ---------- */

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const strip = (name) => name.replace(/^@synccn\//, "");

function fileState(project, f) {
  const p = abs(project, f.path);
  const local = fs.existsSync(p) ? normalize(readText(p)) : null;
  const base = readBase(project, f.path);
  return { local, base, localChanged: local != null && hash(local) !== f.baseHash };
}

/** Three-way merge of one file: your copy, the snapshot it started from, and upstream. */
function mergeFile(local, base, latest) {
  if (local === base) return { content: latest, conflict: false, kind: latest === base ? "same" : "fast-forward" };
  if (latest === base || latest === local) return { content: local, conflict: false, kind: "keep" };
  const r = merge(local.split("\n"), base.split("\n"), latest.split("\n"), { label: { a: "yours", o: "installed", b: "upstream" } });
  return { content: r.result.join("\n"), conflict: r.conflict, kind: r.conflict ? "conflict" : "merged" };
}

/* ---------- commands ---------- */

async function add() {
  if (!names.length) throw new CliError("Name at least one component, e.g. synccn add button.");
  const project = loadProject(cwd);
  const wanted = names.map(strip);
  const tree = await resolveTree(project, wanted, registry);
  const pm = packageManager(cwd);
  const specs = wanted.map((n) => (project.registryTemplate && !registry ? `@synccn/${n}` : registryUrl(project, n, registry)));
  const passthrough = ["--overwrite", "--yes"].filter((f) => flags.has(f) || f === "--yes");
  console.log(c.dim(`Installing ${wanted.join(", ")} with the shadcn CLI…\n`));
  const [bin, ...pre] = pm.dlx.split(" ");
  const r = spawnSync(bin, [...pre, "shadcn@latest", "add", ...specs, ...passthrough], { cwd, stdio: "inherit", env: process.env });
  if (r.status !== 0) throw new CliError("The shadcn CLI stopped with an error, so nothing was tracked.");
  const manifest = loadManifest(project);
  const tracked = [];
  for (const [name, item] of tree) {
    if (manifest.items[name]) continue; // keep the snapshot it already has
    track(project, manifest, name, item);
    tracked.push(name);
  }
  saveManifest(project, manifest);
  console.log(`\n${c.green("✓")} Tracking ${plural(tracked.length, "component")}${tracked.length ? `: ${tracked.join(", ")}` : ""}. Run ${c.cyan("synccn status")} any time.`);
}

async function trackCmd() {
  if (!names.length) throw new CliError("Name the components to track, e.g. synccn track button dialog.");
  const project = loadProject(cwd);
  const manifest = loadManifest(project);
  for (const name of names.map(strip)) {
    const item = await fetchItem(project, name, registry);
    const missing = (item.files ?? []).map((f) => targetPath(project, f)).filter((p) => !fs.existsSync(p));
    if (missing.length) throw new CliError(`${name}: ${missing.map((p) => path.relative(cwd, p)).join(", ")} doesn't exist. Install it with synccn add ${name}.`);
    track(project, manifest, name, item);
    const changed = manifest.items[name].files.filter((f) => fileState(project, f).localChanged).length;
    console.log(`${c.green("✓")} ${name}${changed ? c.dim(` (your copy differs from the current version in ${plural(changed, "file")}; those differences count as your edits)`) : ""}`);
  }
  saveManifest(project, manifest);
}

async function status() {
  const project = loadProject(cwd);
  const manifest = loadManifest(project);
  const entries = Object.entries(manifest.items);
  if (!entries.length) return console.log(`Nothing tracked yet. Use ${c.cyan("synccn add <name>")} or ${c.cyan("synccn track <name>")}.`);
  let updates = 0;
  const rows = [];
  for (const [name, entry] of entries.sort()) {
    const item = await fetchItem(project, name, registry);
    const upstream = item.meta?.version && item.meta.version !== entry.version;
    const states = entry.files.map((f) => fileState(project, f));
    const missing = states.some((s) => s.local == null);
    const edited = states.some((s) => s.localChanged);
    if (upstream) updates++;
    const label = missing ? c.red("file missing") : upstream && edited ? c.yellow("update available · you have edits") : upstream ? c.cyan("update available") : edited ? "you have edits" : c.dim("up to date");
    rows.push([name, label, upstream ? `${entry.version} → ${item.meta.version}` : (entry.version ?? "")]);
  }
  const w = Math.max(...rows.map((r) => r[0].length));
  for (const [n, l, v] of rows) console.log(`  ${n.padEnd(w)}  ${l}  ${c.dim(v)}`);
  console.log(`\n${updates ? `${plural(updates, "update")} available. Preview with ${c.cyan("synccn update --dry-run")}.` : "Everything is current."}`);
}

async function diff() {
  const name = names[0] && strip(names[0]);
  if (!name) throw new CliError("Name a component, e.g. synccn diff button.");
  const project = loadProject(cwd);
  const entry = loadManifest(project).items[name];
  if (!entry) throw new CliError(`${name} isn't tracked. Run synccn track ${name} first.`);
  const item = await fetchItem(project, name, registry);
  for (const file of item.files ?? []) {
    const rel = path.relative(cwd, targetPath(project, file)).split(path.sep).join("/");
    const f = entry.files.find((x) => x.path === rel);
    const { local, base } = f ? fileState(project, f) : { local: null, base: null };
    const latest = transform(project, file.content ?? "");
    const show = (title, a, b, la, lb) => {
      const patch = createTwoFilesPatch(`${rel} (${la})`, `${rel} (${lb})`, a ?? "", b ?? "", "", "", { context: 3 });
      const body = patch.split("\n").slice(4);
      console.log(`\n${c.bold(title)}`);
      if (!body.some((l) => /^[+-]/.test(l))) return console.log(c.dim("  no changes"));
      for (const l of body) console.log(l.startsWith("+") ? c.green(l) : l.startsWith("-") ? c.red(l) : l.startsWith("@@") ? c.cyan(l) : l);
    };
    if (!flags.has("--local")) show(`Upstream changes to ${rel} since you installed it`, base, latest, "installed", "upstream");
    if (!flags.has("--upstream")) show(`Your changes to ${rel}`, base, local, "installed", "yours");
  }
}

async function update() {
  const project = loadProject(cwd);
  if (!project.tsx) throw new CliError('Merging needs TypeScript sources ("tsx": true). In a JavaScript project, review with npx shadcn@latest add @synccn/<name> --diff.');
  const manifest = loadManifest(project);
  const pool = names.length ? names.map(strip) : Object.keys(manifest.items);
  for (const n of pool) if (!manifest.items[n]) throw new CliError(`${n} isn't tracked. Run synccn track ${n} first.`);

  const plan = [];
  for (const name of pool) {
    const entry = manifest.items[name];
    const item = await fetchItem(project, name, registry);
    if (!item.meta?.version || item.meta.version === entry.version) continue;
    const files = (item.files ?? []).map((file) => {
      const rel = path.relative(cwd, targetPath(project, file)).split(path.sep).join("/");
      const f = entry.files.find((x) => x.path === rel);
      const latest = transform(project, file.content ?? "");
      if (!f) return { rel, latest, result: { content: latest, conflict: false, kind: "new file" } };
      const { local, base } = fileState(project, f);
      if (local == null) return { rel, latest, result: { content: latest, conflict: false, kind: "restore missing" } };
      return { rel, latest, result: mergeFile(local, base ?? local, latest) };
    });
    const have = installedPackages(cwd);
    const newPackages = (item.dependencies ?? []).filter((d) => !have.has(d));
    const newComponents = synccnDeps(item).filter((d) => !manifest.items[d]);
    // Only notes since this copy was tracked.
    const since = (entry.trackedAt ?? "").slice(0, 10);
    plan.push({ name, item, entry, files, newPackages, newComponents, changes: (item.meta?.changes ?? []).filter((ch) => ch.date >= since) });
  }

  if (!plan.length) return console.log(names.length ? "Those components are already current." : "Everything is current.");

  console.log(c.bold("Update impact\n"));
  for (const p of plan) {
    console.log(`${c.bold(p.name)}  ${c.dim(`${p.entry.version} → ${p.item.meta.version}`)}`);
    for (const ch of p.changes.slice(0, 3)) console.log(c.dim(`  ${ch.date}: ${ch.summary}${ch.breaking ? c.yellow(" (breaking)") : ""}`));
    for (const f of p.files) {
      const k = f.result.kind;
      const label = k === "conflict" ? c.red("conflict: your edits and upstream touch the same lines") : k === "merged" ? c.green("merged with your edits") : k === "fast-forward" ? "updated (no local edits)" : k === "keep" ? c.dim("no upstream change") : k === "same" ? c.dim("unchanged") : k;
      console.log(`  ${f.rel}  ${label}`);
    }
    if (p.newPackages.length) console.log(c.yellow(`  needs packages: ${p.newPackages.join(", ")}`));
    if (p.newComponents.length) console.log(c.yellow(`  now uses: ${p.newComponents.join(", ")}`));
    console.log("");
  }
  const conflicts = plan.flatMap((p) => p.files.filter((f) => f.result.conflict));
  if (flags.has("--dry-run")) {
    console.log(c.dim(`Dry run: nothing written.${conflicts.length ? ` ${plural(conflicts.length, "file")} would conflict; --force writes them with conflict markers.` : ""}`));
    return;
  }

  const toWrite = plan.flatMap((p) => p.files.filter((f) => f.result.kind !== "same" && f.result.kind !== "keep" && (!f.result.conflict || flags.has("--force"))));
  const id = toWrite.length ? backup(project, toWrite.map((f) => f.rel)) : null;
  for (const f of toWrite) {
    const target = abs(project, f.rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, f.result.content);
  }
  const applied = [];
  for (const p of plan) {
    const blocked = p.files.some((f) => f.result.conflict && !flags.has("--force"));
    if (blocked) continue;
    track(project, manifest, p.name, p.item); // new snapshot = the version you now have
    applied.push(p.name);
  }
  saveManifest(project, manifest);

  if (id) console.log(`${c.green("✓")} Backed up to .synccn/backups/${id} (undo with ${c.cyan(`synccn restore ${id}`)})`);
  if (applied.length) console.log(`${c.green("✓")} Updated ${applied.join(", ")}`);
  if (conflicts.length && !flags.has("--force")) console.log(c.yellow(`! Skipped ${plural(conflicts.length, "file")} with conflicts: ${conflicts.map((f) => f.rel).join(", ")}. Review with synccn diff, then rerun with --force to write conflict markers.`));
  if (conflicts.length && flags.has("--force")) console.log(c.yellow(`! Wrote conflict markers in ${conflicts.map((f) => f.rel).join(", ")}. Search for <<<<<<< and keep what you want.`));
  const pkgs = [...new Set(plan.flatMap((p) => p.newPackages))];
  if (pkgs.length) console.log(`Install the new packages: ${c.cyan(`${packageManager(cwd).add} ${pkgs.join(" ")}`)}`);
  const comps = [...new Set(plan.flatMap((p) => p.newComponents))];
  if (comps.length) console.log(`Add the components they now use: ${c.cyan(`synccn add ${comps.join(" ")}`)}`);
}

async function restore() {
  const project = loadProject(cwd);
  const backups = listBackups(project);
  if (!backups.length) return console.log("No backups yet. synccn update makes one before it changes anything.");
  if (!names[0]) {
    console.log(c.bold("Backups (newest first)"));
    for (const b of backups) console.log(`  ${b.id}  ${c.dim(plural(b.files.length, "file"))}`);
    return console.log(`\nRestore one with ${c.cyan(`synccn restore ${backups[0].id}`)}.`);
  }
  const b = backups.find((x) => x.id === names[0]);
  if (!b) throw new CliError(`No backup called ${names[0]}. Run synccn restore to list them.`);
  restoreBackup(project, b);
  console.log(`${c.green("✓")} Restored ${plural(b.files.length, "file")} and the update tracking from ${b.id}.`);
}

async function doctor() {
  const fix = flags.has("--fix");
  const results = [];
  const ok = (msg) => results.push(["ok", msg]);
  const warn = (msg, tip) => results.push(["warn", msg, tip]);
  const fail = (msg, tip) => results.push(["fail", msg, tip]);

  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    fail("No package.json here.", "Run synccn doctor from your project folder, or pass --cwd.");
    return report(results);
  }
  const pkg = JSON.parse(readText(pkgPath));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const major = (v) => Number(String(v ?? "").replace(/^[^\d]*/, "").split(".")[0]);
  deps.react ? (major(deps.react) >= 19 ? ok(`React ${deps.react}`) : warn(`React ${deps.react}`, "synccn targets React 19. Most components work on 18, but they aren't tested there.")) : fail("React isn't installed.", "Install react and react-dom.");
  deps.tailwindcss ? (major(deps.tailwindcss) >= 4 ? ok(`Tailwind CSS ${deps.tailwindcss}`) : fail(`Tailwind CSS ${deps.tailwindcss}`, "synccn needs Tailwind CSS v4. See https://tailwindcss.com/docs/upgrade-guide.")) : fail("Tailwind CSS isn't installed.", "Follow the installation guide: https://synccn.com/docs/installation");

  let project;
  try {
    project = loadProject(cwd);
    ok("components.json found");
  } catch (e) {
    fail(e.message, "Run npx shadcn@latest init.");
    return report(results);
  }

  for (const key of ["ui", "components", "utils", "lib"]) {
    const alias = project.aliases[key];
    if (!alias) {
      warn(`No "${key}" alias in components.json`, "shadcn falls back to defaults; run npx shadcn@latest init to set them.");
      continue;
    }
    const dir = aliasToDir(project, key === "utils" ? alias.split("/").slice(0, -1).join("/") : alias);
    const covered = Object.keys(project.paths).some((p) => alias.startsWith(p.replace(/\*$/, "")));
    if (!covered && Object.keys(project.paths).length) warn(`Alias "${alias}" isn't in your ${path.basename(project.tsconfigPath)} paths`, "Imports using it won't resolve. Add a matching entry under compilerOptions.paths.");
    else ok(`Alias ${key} → ${path.relative(cwd, dir) || "."}`);
  }

  if (project.registryTemplate) ok(`@synccn registry: ${project.registryTemplate}`);
  else if (fix) {
    const file = path.join(cwd, "components.json");
    const cfg = JSON.parse(readText(file));
    cfg.registries = { ...(cfg.registries ?? {}), "@synccn": DEFAULT_REGISTRY };
    fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
    ok("Added the @synccn registry to components.json");
  } else warn("The @synccn registry isn't in components.json", "Run synccn doctor --fix, or npx shadcn@latest registry add @synccn=" + DEFAULT_REGISTRY);

  const cssPath = project.config.tailwind?.css ? path.join(cwd, project.config.tailwind.css) : null;
  if (!cssPath || !fs.existsSync(cssPath)) fail("The stylesheet in components.json (tailwind.css) doesn't exist.", "Point tailwind.css at your global CSS file.");
  else {
    const css = readText(cssPath);
    if (!/@import\s+["']tailwindcss["']/.test(css)) warn(`${project.config.tailwind.css} doesn't import tailwindcss`, 'Add @import "tailwindcss"; at the top.');
    const hasBase = css.includes("--color-success") && /@keyframes\s+enter\b/.test(css);
    if (hasBase) ok("synccn styles are in your CSS");
    else if (fix) {
      const [bin, ...pre] = packageManager(cwd).dlx.split(" ");
      const r = spawnSync(bin, [...pre, "shadcn@latest", "add", registryUrl(project, "base"), "--yes"], { cwd, stdio: "inherit" });
      r.status === 0 ? ok("Added the synccn styles") : fail("Couldn't add the synccn styles", "Run npx shadcn@latest add @synccn/base yourself.");
    } else warn("synccn styles (tokens, animations, utilities) aren't in your CSS", "Run synccn doctor --fix, or npx shadcn@latest add @synccn/base.");
    for (const token of ["--background", "--foreground", "--primary", "--border", "--ring"]) {
      if (!css.includes(`${token}:`)) {
        warn(`Theme variable ${token} isn't defined`, "Paste a theme from https://synccn.com/themes.");
        break;
      }
    }
  }

  const manifest = loadManifest(project);
  const tracked = Object.entries(manifest.items);
  if (tracked.length) {
    const have = installedPackages(cwd);
    const missingPkgs = new Set();
    const missingFiles = [];
    for (const [name, entry] of tracked) {
      for (const f of entry.files) if (!fs.existsSync(abs(project, f.path))) missingFiles.push(`${name}: ${f.path}`);
      try {
        for (const d of (await fetchItem(project, name, registry)).dependencies ?? []) if (!have.has(d)) missingPkgs.add(d);
      } catch {
        warn(`Couldn't check ${name} against the registry`, "Check your connection or the registry URL.");
      }
    }
    missingFiles.length ? fail(`Tracked files are missing: ${missingFiles.join(", ")}`, "Reinstall with synccn add, or untrack by deleting the entry in .synccn/manifest.json.") : ok(`${plural(tracked.length, "tracked component")}, all files present`);
    missingPkgs.size ? fail(`Packages your components import aren't installed: ${[...missingPkgs].join(", ")}`, `${packageManager(cwd).add} ${[...missingPkgs].join(" ")}`) : ok("Every package the tracked components import is installed");
  } else ok("No components tracked yet");
  report(results);
}

function report(results) {
  const icon = { ok: c.green("✓"), warn: c.yellow("!"), fail: c.red("✗") };
  for (const [kind, msg, tip] of results) {
    console.log(`${icon[kind]} ${msg}`);
    if (tip) console.log(c.dim(`    ${tip}`));
  }
  const fails = results.filter((r) => r[0] === "fail").length;
  const warns = results.filter((r) => r[0] === "warn").length;
  console.log(`\n${fails ? c.red(`${plural(fails, "problem")}`) : c.green("No problems")}${warns ? `, ${plural(warns, "warning")}` : ""}.`);
  if (fails) process.exitCode = 1;
}

/* ---------- run ---------- */

const commands = { add, track: trackCmd, status, diff, update, restore, doctor };
if (!command || flags.has("--help") || command === "help") {
  console.log(HELP);
} else if (!commands[command]) {
  console.error(`${c.red("✗")} Unknown command "${command}".\n`);
  console.log(HELP);
  process.exitCode = 1;
} else {
  try {
    await commands[command]();
  } catch (e) {
    if (e instanceof CliError) {
      console.error(`${c.red("✗")} ${e.message}`);
      process.exitCode = 1;
    } else throw e;
  }
}
