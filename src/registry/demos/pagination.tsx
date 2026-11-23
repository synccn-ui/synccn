"use client";

import { useState } from "react";
import { Pagination } from "@/registry/ui/pagination";

export default function PaginationDemo() {
  const [page, setPage] = useState(6);
  return (
    <div className="grid justify-items-center gap-3">
      <Pagination total={20} page={page} onPageChange={setPage} />
      <p className="text-[13px] tabular-nums text-muted-foreground">Page {page} of 20</p>
    </div>
  );
}
