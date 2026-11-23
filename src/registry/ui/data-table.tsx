"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/registry/ui/checkbox";
import { Input } from "@/registry/ui/input";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";
import { Pagination } from "@/registry/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/ui/table";

export interface DataTableColumn<T> {
  key: keyof T & string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Set false to keep the column out of the Columns menu. */
  hideable?: boolean;
}

export interface DataTableProps<T extends Record<string, any>> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Rows. */
  data: T[];
  /** Rows per page. */
  pageSize?: number;
  /** Fields the search box matches. Defaults to every column. */
  searchKeys?: (keyof T & string)[];
  /** Field that uniquely identifies a row. */
  rowKey?: keyof T & string;
  /** Extra controls next to the Columns menu. */
  toolbar?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Sorting, global search, column visibility, row selection and pagination.
 * columns: [{ key, header, cell?(row), sortable?, align?, hideable? }]
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 5,
  searchKeys,
  rowKey = "id",
  toolbar,
  className,
}: DataTableProps<T>) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: keyof T & string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState(() => new Set<string>());
  const [selected, setSelected] = useState(() => new Set<string>());

  const visible = columns.filter((c) => !hidden.has(c.key));

  const rows = useMemo(() => {
    const keys = searchKeys || columns.map((c) => c.key);
    let r = data.filter(
      (row) =>
        !q ||
        keys.some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(q.toLowerCase())
        )
    );
    if (sort) {
      r = [...r].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [data, q, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r[rowKey]));
  const someOnPage = pageRows.some((r) => selected.has(r[rowKey]));

  const toggleSort = (key: keyof T & string) => setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  const toggleRow = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className={cn("grid w-full gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:max-w-xs">
          <Input
            icon={Search}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search…"
            aria-label="Search rows"
            className="h-8"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <DropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[13px] font-medium shadow-xs hover:bg-accent"
              >
                <SlidersHorizontal className="size-3.5" /> Columns
              </button>
            }
            items={[
              { type: "label" as const, label: "Show columns" },
              ...columns
                .filter((c) => c.hideable !== false)
                .map((c) => ({
                  type: "checkbox" as const,
                  label: c.header,
                  checked: !hidden.has(c.key),
                  onCheckedChange: () =>
                    setHidden((h) => {
                      const n = new Set(h);
                      n.has(c.key) ? n.delete(c.key) : n.add(c.key);
                      return n;
                    }),
                })),
            ]}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                  onCheckedChange={() =>
                    setSelected((s) => {
                      const n = new Set(s);
                      pageRows.forEach((r) => (allOnPage ? n.delete(r[rowKey]) : n.add(r[rowKey])));
                      return n;
                    })
                  }
                />
              </TableHead>
              {visible.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(c.align === "right" && "text-right")}
                  aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-accent hover:text-foreground",
                        c.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={visible.length + 1} className="h-28 text-center text-muted-foreground">
                  No rows match “{q}”. Clear the search to see everything.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row) => (
              <TableRow key={row[rowKey]} data-state={selected.has(row[rowKey]) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox checked={selected.has(row[rowKey])} onCheckedChange={() => toggleRow(row[rowKey])} />
                </TableCell>
                {visible.map((c) => (
                  <TableCell key={c.key} className={cn(c.align === "right" && "text-right tabular-nums")}>
                    {c.cell ? c.cell(row) : row[c.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-foreground">
        <span>
          {selected.size} of {rows.length} selected
        </span>
        <Pagination total={pages} page={safePage} onPageChange={setPage} />
      </div>
    </div>
  );
}
