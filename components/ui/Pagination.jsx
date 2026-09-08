// components/ui/Pagination.jsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {start > 1 && (
        <>
          <Link href={buildHref(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm hover:bg-surface">
            1
          </Link>
          {start > 2 && <span className="px-1 text-muted">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${
            p === page ? "border-brand-700 bg-brand-700 text-white" : "border-border hover:bg-surface"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted">…</span>}
          <Link href={buildHref(totalPages)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm hover:bg-surface">
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
