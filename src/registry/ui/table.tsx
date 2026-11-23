import type * as React from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-x-auto scrollbar-thin">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableHeader = ({ className, ...p }: TableHeaderProps) => <thead className={cn("[&_tr]:border-b", className)} {...p} />;

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableBody = ({ className, ...p }: TableBodyProps) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...p} />;

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableFooter = ({ className, ...p }: TableFooterProps) => (
  <tfoot className={cn("border-t bg-muted/50 font-medium", className)} {...p} />
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableRow = ({ className, ...p }: TableRowProps) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-brand-soft", className)} {...p} />
);

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableHead = ({ className, ...p }: TableHeadProps) => (
  <th
    className={cn("h-10 whitespace-nowrap px-3 text-left align-middle text-[13px] font-medium text-muted-foreground", className)}
    {...p}
  />
);

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableCell = ({ className, ...p }: TableCellProps) => (
  <td className={cn("whitespace-nowrap px-3 py-2.5 align-middle", className)} {...p} />
);

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export const TableCaption = ({ className, ...p }: TableCaptionProps) => (
  <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...p} />
);
