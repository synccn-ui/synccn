"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { Check, Copy, Eye, EyeOff, Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface KeyValuePair {
  /** Stable id for the row. */
  id: string;
  key: string;
  value: string;
  /** Masks the value until revealed. */
  secret?: boolean;
}

export interface KeyValueEditorProps {
  /** Controlled rows. */
  value?: KeyValuePair[];
  /** Rows at first, when uncontrolled. */
  defaultValue?: KeyValuePair[];
  /** Called with every change. */
  onValueChange?: (pairs: KeyValuePair[]) => void;
  /**
   * "env" upper-cases keys and only allows letters, digits and underscores, like environment variables.
   * @default "env"
   */
  keyFormat?: "env" | "free";
  /**
   * Shows a lock on each row to mark values as secret.
   * @default true
   */
  allowSecrets?: boolean;
  /**
   * Placeholder for new keys.
   * @default "KEY"
   */
  keyPlaceholder?: string;
  /**
   * Placeholder for new values.
   * @default "value"
   */
  valuePlaceholder?: string;
  /** Extra classes for the root element. */
  className?: string;
}

let seq = 0;
const newId = () => `kv_${Date.now().toString(36)}_${(seq++).toString(36)}`;
const ENV_KEY = /^[A-Z_][A-Z0-9_]*$/;

/** Parses `KEY=value` lines (a .env file), skipping blanks and comments and unquoting values. */
export function parseEnv(text: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/^export\s+/, "");
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    let value = line.slice(eq + 1).trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    out.push({ key: line.slice(0, eq).trim(), value });
  }
  return out;
}

/** Writes rows as a .env file, quoting values that need it. */
export function toEnv(pairs: { key: string; value: string }[]): string {
  return pairs
    .filter((p) => p.key)
    .map((p) => `${p.key}=${/[\s#"'=]/.test(p.value) ? JSON.stringify(p.value) : p.value}`)
    .join("\n");
}

/**
 * Editor for environment variables, headers or metadata: add and remove rows, mark
 * values secret, paste a whole .env file into any key field, and copy everything back out.
 * Duplicate and invalid keys are flagged as you type.
 */
export function KeyValueEditor({
  value,
  defaultValue = [],
  onValueChange,
  keyFormat = "env",
  allowSecrets = true,
  keyPlaceholder = "KEY",
  valuePlaceholder = "value",
  className,
}: KeyValueEditorProps) {
  const [pairs, setPairs] = useControllable<KeyValuePair[]>({ value, defaultValue, onChange: onValueChange });
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);

  const formatKey = (k: string) => (keyFormat === "env" ? k.toUpperCase().replace(/[^A-Z0-9_]/g, "_") : k);

  const problems = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of pairs) if (p.key) seen.set(p.key, (seen.get(p.key) ?? 0) + 1);
    const out: Record<string, string> = {};
    for (const p of pairs) {
      if (!p.key && p.value) out[p.id] = "Add a key for this value.";
      else if (p.key && (seen.get(p.key) ?? 0) > 1) out[p.id] = `${p.key} is used more than once.`;
      else if (p.key && keyFormat === "env" && !ENV_KEY.test(p.key)) out[p.id] = "Keys can't start with a digit.";
    }
    return out;
  }, [pairs, keyFormat]);

  const update = (id: string, patch: Partial<KeyValuePair>) => setPairs(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const focusKey = (id: string) => requestAnimationFrame(() => root.current?.querySelector<HTMLInputElement>(`[data-key-input="${id}"]`)?.focus());

  const add = () => {
    const id = newId();
    setPairs([...pairs, { id, key: "", value: "" }]);
    focusKey(id);
  };

  const remove = (id: string) => {
    const i = pairs.findIndex((p) => p.id === id);
    const next = pairs.filter((p) => p.id !== id);
    setPairs(next);
    const target = next[Math.min(i, next.length - 1)];
    if (target) focusKey(target.id);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>, id: string) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("=") || !/\n|^[^=\s]+=/.test(text)) return;
    const parsed = parseEnv(text);
    if (!parsed.length) return;
    e.preventDefault();
    const at = pairs.findIndex((p) => p.id === id);
    const current = pairs[at];
    // An empty row is replaced by the pasted rows; otherwise they go after it.
    const replace = !!current && !current.key && !current.value;
    const updates = new Map<string, string>();
    const fresh: KeyValuePair[] = [];
    for (const { key, value: v } of parsed) {
      const k = formatKey(key);
      if (pairs.some((p) => p.key === k && p.id !== id)) updates.set(k, v);
      else {
        const dupe = fresh.find((f) => f.key === k);
        if (dupe) dupe.value = v;
        else fresh.push({ id: newId(), key: k, value: v, secret: /secret|token|key|password/i.test(k) });
      }
    }
    const kept = pairs.map((p) => (updates.has(p.key) && p.id !== id ? { ...p, value: updates.get(p.key) ?? p.value } : p));
    const next = [...kept.slice(0, replace ? at : at + 1), ...fresh, ...kept.slice(at + 1)];
    setPairs(next);
    if (fresh[0]) focusKey(fresh[fresh.length - 1].id);
    setNotice(`Imported ${fresh.length} ${fresh.length === 1 ? "variable" : "variables"}${updates.size ? `, updated ${updates.size}` : ""}.`);
  };

  const copyAll = async () => {
    if (await copyText(toEnv(pairs))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const filled = pairs.filter((p) => p.key).length;

  return (
    <div ref={root} className={cn("grid w-full gap-3 text-left", className)}>
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
        <span>Key</span>
        <span>Value</span>
        <span className={cn(allowSecrets ? "w-[68px]" : "w-8")} />
      </div>

      <ul className="grid gap-3 sm:gap-2">
        {pairs.map((p, i) => {
          const masked = p.secret && !revealed.has(p.id);
          const problem = problems[p.id];
          return (
            <li key={p.id} className="grid gap-1">
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]">
                <input
                  data-key-input={p.id}
                  value={p.key}
                  onChange={(e) => update(p.id, { key: formatKey(e.target.value) })}
                  onPaste={(e) => onPaste(e, p.id)}
                  placeholder={keyPlaceholder}
                  aria-label={`Key ${i + 1}`}
                  aria-invalid={!!problem || undefined}
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(
                    "h-9 min-w-0 rounded-md border border-input bg-background px-3 font-mono text-[13px] shadow-xs outline-none transition-[border-color,box-shadow]",
                    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
                    problem && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                  )}
                />
                <div className="col-start-1 row-start-2 flex min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 sm:col-start-auto sm:row-start-auto">
                  <input
                    type={masked ? "password" : "text"}
                    value={p.value}
                    onChange={(e) => update(p.id, { value: e.target.value })}
                    placeholder={valuePlaceholder}
                    aria-label={`Value for ${p.key || `key ${i + 1}`}`}
                    spellCheck={false}
                    autoComplete="off"
                    className="h-9 min-w-0 flex-1 bg-transparent px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground"
                  />
                  {p.secret && (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((s) => {
                          const n = new Set(s);
                          n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                          return n;
                        })
                      }
                      aria-label={masked ? `Show value of ${p.key || "this key"}` : `Hide value of ${p.key || "this key"}`}
                      className="mr-1 grid size-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {masked ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                  )}
                </div>
                <div className="row-span-2 flex items-start gap-1 sm:row-span-1 sm:items-center">
                  {allowSecrets && (
                    <button
                      type="button"
                      aria-pressed={!!p.secret}
                      aria-label={`Secret value for ${p.key || `key ${i + 1}`}`}
                      title={p.secret ? "Secret: hidden in the dashboard" : "Mark as secret"}
                      onClick={() => update(p.id, { secret: !p.secret })}
                      className={cn("grid size-9 place-items-center rounded-md transition-colors hover:bg-accent", p.secret ? "text-foreground" : "text-muted-foreground")}
                    >
                      {p.secret ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${p.key || `row ${i + 1}`}`}
                    onClick={() => remove(p.id)}
                    className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {problem && <p className="px-1 text-xs text-destructive">{problem}</p>}
            </li>
          );
        })}
      </ul>

      {pairs.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">No variables yet. Add one, or paste a .env file into the first key.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={add}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-[13px] font-medium shadow-xs hover:bg-accent"
        >
          <Plus className="size-4" /> Add variable
        </button>
        <button
          type="button"
          onClick={copyAll}
          disabled={!filled}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy as .env"}
        </button>
        <p className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {notice || "Tip: paste a .env file into any key."}
        </p>
      </div>
    </div>
  );
}
