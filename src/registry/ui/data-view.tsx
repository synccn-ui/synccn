"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Bookmark, Columns3, Inbox, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";
import { Input } from "@/registry/ui/input";
import { Pagination } from "@/registry/ui/pagination";
import { Select } from "@/registry/ui/select";

export interface DataViewColumn<T> {
  /** Unique id; also the row field read when there's no `value`. */
  key: string;
  /** Column heading. */
  header: React.ReactNode;
  /** Value used for sorting and search. Defaults to row[key]. */
  value?: (row: T) => string | number | boolean | Date | null | undefined;
  /** Custom cell content. Defaults to the value as text. */
  cell?: (row: T) => React.ReactNode;
  /** Allow sorting by this column. */
  sortable?: boolean;
  /** Allow hiding from the Columns menu. Default true. */
  hideable?: boolean;
  /** Start hidden. */
  hidden?: boolean;
  /** Starting width in px. Columns without one share the remaining space. */
  width?: number;
  /** Narrowest the column can be resized to, in px. */
  minWidth?: number;
  /** Text alignment. */
  align?: "left" | "right" | "center";
}

export interface DataViewSort {
  key: string;
  direction: "asc" | "desc";
}

/** Everything a view remembers: what a saved view restores, and what server mode reports. */
export interface DataViewState {
  search: string;
  sort: DataViewSort | null;
  page: number;
  pageSize: number;
  hidden: string[];
}

export interface DataViewSavedView {
  name: string;
  state: Pick<DataViewState, "search" | "sort" | "hidden" | "pageSize">;
}

export interface DataViewProps<T> {
  /** Column definitions. */
  columns: DataViewColumn<T>[];
  /** Rows. In server mode, only the current page. */
  data: T[];
  /** Stable id for each row (selection survives sorting and paging). */
  rowKey: (row: T) => string;
  /** "client" sorts, searches and pages `data` itself; "server" reports state changes and shows `data` as is. */
  mode?: "client" | "server";
  /** Total rows on the server (server mode). */
  rowCount?: number;
  /** Called whenever search, sort, page or page size change. Fetch here in server mode. */
  onStateChange?: (state: DataViewState) => void;
  /** Extra filter applied before search (client mode), e.g. from a FilterBuilder. */
  filter?: (row: T) => boolean;
  /** Show skeleton rows. */
  loading?: boolean;
  /** Show an error with a retry button. */
  error?: React.ReactNode;
  /** Called by the retry button. */
  onRetry?: () => void;
  /** Shown when there are no rows. */
  empty?: React.ReactNode;
  /** Page size choices. The first is the default. */
  pageSizes?: number[];
  /** Allow selecting rows with checkboxes. */
  selectable?: boolean;
  /** Toolbar shown while rows are selected. Gets the selected rows and a function to clear them. */
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode;
  /** Called when a row is clicked or Enter is pressed on it. */
  onRowClick?: (row: T) => void;
  /** Starting saved views. */
  views?: DataViewSavedView[];
  /** Keep saved views in localStorage under this key. */
  storageKey?: string;
  /** Extra controls on the right of the toolbar. */
  toolbar?: React.ReactNode;
  /** Search box placeholder. */
  searchPlaceholder?: string;
  /** Accessible name for the table. */
  label?: string;
  /** Extra classes for the root element. */
  className?: string;
}

const readStore = (key?: string): DataViewSavedView[] | null => {
  if (!key || typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as DataViewSavedView[]) : null;
  } catch {
    return null;
  }
};

const compare = (a: unknown, b: unknown) => {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Data table for real apps: search, sort, column visibility and resizing, selection with
 * bulk actions, saved views, and loading, empty and error states. Works on local data or
 * as a view over a server (mode="server").
 */
export function DataView<T>({
  columns,
  data,
  rowKey,
  mode = "client",
  rowCount,
  onStateChange,
  filter,
  loading = false,
  error,
  onRetry,
  empty,
  pageSizes = [10, 25, 50],
  selectable = false,
  bulkActions,
  onRowClick,
  views: initialViews = [],
  storageKey,
  toolbar,
  searchPlaceholder = "Search…",
  label = "Data",
  className,
}: DataViewProps<T>) {
  const [state, setState] = useState<DataViewState>(() => ({
    search: "",
    sort: null,
    page: 1,
    pageSize: pageSizes[0],
    hidden: columns.filter((c) => c.hidden).map((c) => c.key),
  }));
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(columns.filter((c) => c.width).map((c) => [c.key, c.width as number])));
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [views, setViews] = useState<DataViewSavedView[]>(initialViews);
  const [activeView, setActiveView] = useState<string | null>(null);
  const [naming, setNaming] = useState(false);
  const [viewName, setViewName] = useState("");

  // Saved views come back from storage after hydration, so server and client markup match.
  useEffect(() => {
    const stored = readStore(storageKey);
    if (stored) setViews(stored);
  }, [storageKey]);
  const persist = (next: DataViewSavedView[]) => {
    setViews(next);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage full or blocked: views still work for this visit */
      }
    }
  };

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  const update = (patch: Partial<DataViewState>, keepView = false) => {
    setState((s) => {
      const next = { ...s, ...patch };
      onStateChangeRef.current?.(next);
      return next;
    });
    if (!keepView) setActiveView(null);
  };

  const visible = columns.filter((c) => !state.hidden.includes(c.key));
  const valueOf = (c: DataViewColumn<T>, row: T) => (c.value ? c.value(row) : (row as Record<string, unknown>)[c.key]);

  const processed = useMemo(() => {
    if (mode === "server") return data;
    let rows = filter ? data.filter(filter) : data;
    const q = state.search.trim().toLowerCase();
    if (q) rows = rows.filter((r) => columns.some((c) => String(valueOf(c, r) ?? "").toLowerCase().includes(q)));
    if (state.sort) {
      const col = columns.find((c) => c.key === state.sort?.key);
      if (col) {
        const dir = state.sort.direction === "asc" ? 1 : -1;
        rows = [...rows].sort((a, b) => compare(valueOf(col, a), valueOf(col, b)) * dir);
      }
    }
    return rows;
    // valueOf only reads columns, which are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filter, state.search, state.sort, columns, mode]);

  const total = mode === "server" ? (rowCount ?? data.length) : processed.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  const page = Math.min(state.page, pages);
  const rows = mode === "server" ? processed : processed.slice((page - 1) * state.pageSize, page * state.pageSize);
  const selectedRows = processed.filter((r) => selected.has(rowKey(r)));
  const pageKeys = rows.map(rowKey);
  const allOnPage = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const someOnPage = pageKeys.some((k) => selected.has(k));

  const toggleSort = (key: string) => {
    const s = state.sort;
    update({ sort: !s || s.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null, page: 1 });
  };

  const startResize = (key: string, e: React.PointerEvent) => {
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const startX = e.clientX;
    const startW = th.getBoundingClientRect().width;
    const min = columns.find((c) => c.key === key)?.minWidth ?? 64;
    const move = (ev: PointerEvent) => setWidths((w) => ({ ...w, [key]: Math.max(min, Math.round(startW + ev.clientX - startX)) }));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const resizeKey = (key: string, e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const min = columns.find((c) => c.key === key)?.minWidth ?? 64;
    const w = widths[key] ?? th.getBoundingClientRect().width;
    setWidths((all) => ({ ...all, [key]: Math.max(min, Math.round(w + (e.key === "ArrowRight" ? 16 : -16))) }));
  };

  const applyView = (v: DataViewSavedView) => {
    update({ ...v.state, page: 1 }, true);
    setActiveView(v.name);
  };
  const saveView = () => {
    const name = viewName.trim();
    if (!name) return;
    const view = { name, state: { search: state.search, sort: state.sort, hidden: state.hidden, pageSize: state.pageSize } };
    persist([...views.filter((v) => v.name !== name), view]);
    setActiveView(name);
    setNaming(false);
    setViewName("");
  };

  const span = visible.length + (selectable ? 1 : 0);
  const clear = () => setSelected(new Set());

  return (
    <div className={cn("grid min-w-0 gap-3", className)}>
      {views.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saved views">
          {views.map((v) => (
            <span key={v.name} className={cn("inline-flex items-center rounded-full border text-xs", activeView === v.name && "border-foreground/40 bg-accent")}>
              <button type="button" aria-pressed={activeView === v.name} onClick={() => applyView(v)} className="rounded-l-full py-1 pl-3 pr-1.5 font-medium focus-visible:outline-2 focus-visible:outline-ring">
                {v.name}
              </button>
              <button
                type="button"
                aria-label={`Delete view ${v.name}`}
                onClick={() => {
                  persist(views.filter((x) => x.name !== v.name));
                  if (activeView === v.name) setActiveView(null);
                }}
                className="grid size-6 place-items-center rounded-r-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {selectable && selectedRows.length > 0 && bulkActions ? (
          <div role="toolbar" aria-label="Bulk actions" className="flex min-h-9 flex-1 flex-wrap items-center gap-2 rounded-lg border bg-accent/50 px-2 py-1">
            <span className="px-1 text-sm font-medium tabular-nums">{selectedRows.length} selected</span>
            {bulkActions(selectedRows, clear)}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={clear}>
              Clear
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full sm:w-64">
              <Input icon={Search} value={state.search} onChange={(e) => update({ search: e.target.value, page: 1 })} placeholder={searchPlaceholder} aria-label="Search rows" className="h-9" />
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {toolbar}
              {naming ? (
                <form
                  className="flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveView();
                  }}
                >
                  <Input autoFocus value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="View name" aria-label="View name" className="h-9 w-36" onKeyDown={(e) => e.key === "Escape" && setNaming(false)} />
                  <Button size="sm" type="submit" disabled={!viewName.trim()}>
                    Save
                  </Button>
                </form>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setNaming(true)}>
                  <Bookmark /> Save view
                </Button>
              )}
              <DropdownMenu
                align="end"
                trigger={
                  <Button variant="outline" size="sm">
                    <Columns3 /> Columns
                  </Button>
                }
                items={[
                  { type: "label", label: "Show columns" },
                  ...columns
                    .filter((c) => c.hideable !== false)
                    .map((c) => ({
                      type: "checkbox" as const,
                      label: c.header,
                      checked: !state.hidden.includes(c.key),
                      onCheckedChange: (on: boolean) => update({ hidden: on ? state.hidden.filter((k) => k !== c.key) : [...state.hidden, c.key] }),
                    })),
                ]}
              />
            </div>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border scrollbar-thin">
        <table className="w-full table-fixed border-collapse text-sm" aria-label={label} aria-busy={loading || undefined}>
          <colgroup>
            {selectable && <col style={{ width: 44 }} />}
            {visible.map((c) => (
              <col key={c.key} style={{ width: widths[c.key] }} />
            ))}
          </colgroup>
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              {selectable && (
                <th className="border-b px-3 py-2">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        for (const k of pageKeys) allOnPage ? n.delete(k) : n.add(k);
                        return n;
                      })
                    }
                  />
                </th>
              )}
              {visible.map((c) => {
                const sorted = state.sort?.key === c.key ? state.sort.direction : null;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    className={cn("relative border-b px-3 py-2 font-medium", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                  >
                    {c.sortable ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className={cn("inline-flex max-w-full items-center gap-1 rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring", sorted && "text-foreground")}>
                        <span className="truncate">{c.header}</span>
                        {sorted === "asc" ? <ArrowUp className="size-3.5 shrink-0" /> : sorted === "desc" ? <ArrowDown className="size-3.5 shrink-0" /> : <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />}
                      </button>
                    ) : (
                      <span className="block truncate">{c.header}</span>
                    )}
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${typeof c.header === "string" ? c.header : c.key} column`}
                      tabIndex={0}
                      onPointerDown={(e) => startResize(c.key, e)}
                      onKeyDown={(e) => resizeKey(c.key, e)}
                      className="absolute inset-y-1.5 right-0 w-1.5 cursor-col-resize rounded-full hover:bg-foreground/20 focus-visible:bg-ring focus-visible:outline-none"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(state.pageSize, 6) }, (_, i) => (
                <tr key={i} className="border-b last:border-0">
                  {Array.from({ length: span }, (_, j) => (
                    <td key={j} className="px-3 py-3">
                      <span className="block h-3.5 animate-pulse rounded bg-muted" style={{ width: `${45 + ((i * 7 + j * 13) % 45)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={span} className="px-3 py-12">
                  <div role="alert" className="grid justify-items-center gap-3 text-center">
                    <AlertCircle className="size-6 text-destructive" />
                    <div className="text-sm">{error}</div>
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        <RotateCcw /> Try again
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={span} className="px-3 py-12">
                  {empty ?? (
                    <div className="grid justify-items-center gap-2 text-center text-sm text-muted-foreground">
                      <Inbox className="size-6" />
                      {state.search ? `No rows match "${state.search}".` : "No rows yet."}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const k = rowKey(row);
                const isSel = selected.has(k);
                return (
                  <tr
                    key={k}
                    aria-selected={selectable ? isSel : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={onRowClick ? (e) => e.key === "Enter" && e.target === e.currentTarget && onRowClick(row) : undefined}
                    className={cn("border-b transition-colors last:border-0", onRowClick && "cursor-pointer hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none", isSel && "bg-brand-soft")}
                  >
                    {selectable && (
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label="Select row"
                          checked={isSel}
                          onCheckedChange={() =>
                            setSelected((s) => {
                              const n = new Set(s);
                              n.has(k) ? n.delete(k) : n.add(k);
                              return n;
                            })
                          }
                        />
                      </td>
                    )}
                    {visible.map((c) => (
                      <td key={c.key} className={cn("truncate px-3 py-2.5", c.align === "right" && "text-right tabular-nums", c.align === "center" && "text-center")}>
                        {c.cell ? c.cell(row) : String(valueOf(c, row) ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span aria-live="polite" className="tabular-nums">
            {loading ? "Loading…" : total === 0 ? "0 rows" : `${(page - 1) * state.pageSize + 1}–${Math.min(page * state.pageSize, total)} of ${total}`}
          </span>
          <Select
            aria-label="Rows per page"
            value={String(state.pageSize)}
            onValueChange={(v) => update({ pageSize: Number(v), page: 1 })}
            options={pageSizes.map((n) => ({ value: String(n), label: `${n} / page` }))}
            className="h-8 w-28"
          />
        </div>
        {pages > 1 && <Pagination total={pages} page={page} onPageChange={(p) => update({ page: p }, true)} />}
      </div>
    </div>
  );
}
