// Shared pieces: project config, alias resolution, the registry, the manifest and backups.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const DEFAULT_REGISTRY = "https://synccn.com/r/{name}.json";
const STATE_DIR = ".synccn";

/* ---------- output ---------- */

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
export const c = { bold: paint(1), dim: paint(2), red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36) };

export class CliError extends Error {}

/* ---------- files ---------- */

export const readText = (p) => fs.readFileSync(p, "utf8");
export const normalize = (s) => s.replace(/\r\n/g, "\n");
export const hash = (s) => createHash("sha256").update(normalize(s)).digest("hex").slice(0, 16);

function readJsonc(p) {
  // tsconfig and jsconfig allow comments and trailing commas. Strip them outside strings
  // only: "**/*.ts" in an include list is not a comment.
  const src = readText(p);
  let out = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 1;
      if (i === 0) break;
    } else out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

/* ---------- project ---------- */

/** Reads components.json and works out where each alias lives on disk. */
export function loadProject(cwd) {
  const file = path.join(cwd, "components.json");
  if (!fs.existsSync(file)) throw new CliError(`No components.json in ${cwd}. Run "npx shadcn@latest init" first.`);
  let config;
  try {
    config = JSON.parse(readText(file));
  } catch {
    throw new CliError("components.json isn't valid JSON.");
  }
  const tsconfigPath = ["tsconfig.json", "jsconfig.json"].map((f) => path.join(cwd, f)).find((f) => fs.existsSync(f));
  let paths = {};
  if (tsconfigPath) {
    try {
      paths = readJsonc(tsconfigPath).compilerOptions?.paths ?? {};
    } catch {
      paths = {};
    }
  }
  const registry = config.registries?.["@synccn"];
  return {
    cwd,
    config,
    tsx: config.tsx !== false,
    rsc: config.rsc === true,
    aliases: config.aliases ?? {},
    paths,
    tsconfigPath,
    registryTemplate: typeof registry === "string" ? registry : (registry?.url ?? null),
  };
}

/** "@/components/ui" -> absolute folder, using the tsconfig paths the same way the compiler does. */
export function aliasToDir(project, alias) {
  for (const [pattern, targets] of Object.entries(project.paths)) {
    const prefix = pattern.replace(/\*$/, "");
    if (pattern.endsWith("*") && alias.startsWith(prefix)) {
      const target = String(targets[0]).replace(/\*$/, "");
      return path.resolve(project.cwd, target, alias.slice(prefix.length));
    }
  }
  // No paths: shadcn's default is "@/" at the project root, or src/ if it exists.
  const rest = alias.replace(/^[@~]\//, "");
  const base = fs.existsSync(path.join(project.cwd, "src")) ? "src" : ".";
  return path.resolve(project.cwd, base, rest);
}

const FOLDER_FOR = { "registry:ui": "ui", "registry:lib": "lib", "registry:hook": "hooks" };

/** Where a registry file lands in this project. */
export function targetPath(project, file) {
  const alias = project.aliases[FOLDER_FOR[file.type]] ?? project.aliases.components ?? "@/components";
  let name = path.basename(file.path);
  if (!project.tsx) name = name.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
  return path.join(aliasToDir(project, alias), name);
}

/**
 * What the shadcn CLI writes for a registry file in this project: imports rewritten to
 * the project's aliases, and "use client" dropped when the project isn't using RSC.
 */
export function transform(project, content) {
  const a = project.aliases;
  let out = normalize(content);
  const swap = (from, to) => {
    if (!to || to === from) return;
    out = out.replace(new RegExp(`(["'])${from.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?=["'/])`, "g"), `$1${to}`);
  };
  swap("@/components/ui", a.ui);
  swap("@/lib/utils", a.utils);
  swap("@/lib", a.lib);
  swap("@/hooks", a.hooks);
  swap("@/components", a.components);
  if (!project.rsc) out = out.replace(/^(["'])use client\1;?\s*\n+/, "");
  // shadcn also drops a comment that opens the file (e.g. a JSDoc on the first function).
  out = out.replace(/^\/\*[\s\S]*?\*\/[ \t]*\n/, "");
  return out;
}

/* ---------- registry ---------- */

export function registryUrl(project, name, override) {
  const template = override ?? project.registryTemplate ?? DEFAULT_REGISTRY;
  return template.includes("{name}") ? template.replace("{name}", name) : `${template.replace(/\/$/, "")}/${name}.json`;
}

const cache = new Map();
export async function fetchItem(project, name, override) {
  const url = registryUrl(project, name, override);
  if (cache.has(url)) return cache.get(url);
  let res;
  try {
    res = await fetch(url, { headers: { accept: "application/json" } });
  } catch (e) {
    throw new CliError(`Couldn't reach ${url} (${e.cause?.code ?? e.message}). Check your connection or the registry URL.`);
  }
  if (res.status === 404) throw new CliError(`"${name}" isn't in the registry (${url} returned 404).`);
  if (!res.ok) throw new CliError(`${url} returned ${res.status}.`);
  const item = await res.json();
  cache.set(url, item);
  return item;
}

/** The synccn item names an item depends on (URLs on the same registry or @synccn/ names). */
export function synccnDeps(item) {
  return (item.registryDependencies ?? [])
    .map((d) => (d.startsWith("@synccn/") ? d.slice(8) : /^https?:\/\//.test(d) ? d.split("/").pop().replace(/\.json$/, "") : null))
    .filter(Boolean);
}

/** An item and everything it depends on, depth first, each once. */
export async function resolveTree(project, names, override) {
  const seen = new Map();
  const visit = async (name) => {
    if (seen.has(name)) return;
    const item = await fetchItem(project, name, override);
    seen.set(name, item);
    for (const d of synccnDeps(item)) await visit(d);
  };
  for (const n of names) await visit(n);
  return seen;
}

/* ---------- manifest, snapshots, backups ---------- */

const stateDir = (project) => path.join(project.cwd, STATE_DIR);
const manifestPath = (project) => path.join(stateDir(project), "manifest.json");
const baseDir = (project) => path.join(stateDir(project), "base");

export function loadManifest(project) {
  const p = manifestPath(project);
  if (!fs.existsSync(p)) return { version: 1, items: {} };
  return JSON.parse(readText(p));
}

export function saveManifest(project, manifest) {
  fs.mkdirSync(stateDir(project), { recursive: true });
  fs.writeFileSync(manifestPath(project), JSON.stringify(manifest, null, 2) + "\n");
  const ignore = path.join(stateDir(project), ".gitignore");
  // Snapshots and backups are local; the manifest is worth committing.
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, "base/\nbackups/\n");
}

const rel = (project, abs) => path.relative(project.cwd, abs).split(path.sep).join("/");
export const abs = (project, relPath) => path.join(project.cwd, relPath);

export function readBase(project, relPath) {
  const p = path.join(baseDir(project), relPath);
  return fs.existsSync(p) ? readText(p) : null;
}

export function writeBase(project, relPath, content) {
  const p = path.join(baseDir(project), relPath);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

/** Records an item as installed at its current registry version. */
export function track(project, manifest, name, item) {
  const files = [];
  for (const f of item.files ?? []) {
    const target = targetPath(project, f);
    const relPath = rel(project, target);
    // In JavaScript projects shadcn converts the TypeScript itself, so the snapshot is the
    // file as installed: right after `synccn add` that's exactly what shadcn wrote.
    const content = !project.tsx && fs.existsSync(target) ? normalize(readText(target)) : transform(project, f.content ?? "");
    writeBase(project, relPath, content);
    files.push({ path: relPath, type: f.type, baseHash: hash(content) });
  }
  manifest.items[name] = { version: item.meta?.version ?? null, trackedAt: new Date().toISOString(), files };
}

export function backup(project, files) {
  const id = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(stateDir(project), "backups", id);
  for (const f of files) {
    const from = abs(project, f);
    if (!fs.existsSync(from)) continue;
    const to = path.join(dir, "files", f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  if (fs.existsSync(manifestPath(project))) {
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(manifestPath(project), path.join(dir, "manifest.json"));
    // Snapshots too, so a restore puts update tracking back exactly as it was.
    const base = baseDir(project);
    if (fs.existsSync(base)) fs.cpSync(base, path.join(dir, "base"), { recursive: true });
  }
  return id;
}

export function listBackups(project) {
  const dir = path.join(stateDir(project), "backups");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .sort()
    .reverse()
    .map((id) => {
      const files = [];
      const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name));
      };
      walk(path.join(dir, id, "files"));
      return { id, dir: path.join(dir, id), files: files.map((f) => path.relative(path.join(dir, id, "files"), f).split(path.sep).join("/")) };
    });
}

export function restoreBackup(project, backupEntry) {
  for (const f of backupEntry.files) {
    const to = abs(project, f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(backupEntry.dir, "files", f), to);
  }
  const m = path.join(backupEntry.dir, "manifest.json");
  if (fs.existsSync(m)) fs.copyFileSync(m, manifestPath(project));
  const base = path.join(backupEntry.dir, "base");
  if (fs.existsSync(base)) {
    fs.rmSync(baseDir(project), { recursive: true, force: true });
    fs.cpSync(base, baseDir(project), { recursive: true });
  }
}

/* ---------- package manager ---------- */

export function packageManager(cwd) {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return { name: "pnpm", add: "pnpm add", dlx: "pnpm dlx" };
  if (fs.existsSync(path.join(cwd, "bun.lock")) || fs.existsSync(path.join(cwd, "bun.lockb"))) return { name: "bun", add: "bun add", dlx: "bunx --bun" };
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return { name: "yarn", add: "yarn add", dlx: "yarn dlx" };
  return { name: "npm", add: "npm install", dlx: "npx" };
}

export function installedPackages(cwd) {
  const p = path.join(cwd, "package.json");
  if (!fs.existsSync(p)) return new Set();
  const pkg = JSON.parse(readText(p));
  return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
}
