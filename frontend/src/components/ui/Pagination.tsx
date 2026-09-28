import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Windowed page list, e.g. [1,2,3,4,5,'…',13]. */
export function pageWindow(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

export function clampPage(raw: unknown, count: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), Math.max(count, 1));
}

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const btn = 'flex h-7 min-w-7 items-center justify-center rounded border px-1.5 text-xs';
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button type="button" aria-label="Previous page" className={`${btn} border-line bg-surface disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={14} />
      </button>
      {pageWindow(page, pageCount).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1 text-muted">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink hover:bg-page'}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" aria-label="Next page" className={`${btn} border-line bg-surface disabled:opacity-40`} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
