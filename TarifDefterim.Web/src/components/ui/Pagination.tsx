import { Link } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildPageUrl }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Sayfalandırma"
    >
      {currentPage > 1 ? (
        <Link to={buildPageUrl(currentPage - 1)} className="btn-secondary px-4 py-1.5">
          Önceki
        </Link>
      ) : (
        <span className="btn-secondary cursor-not-allowed px-4 py-1.5 opacity-50">Önceki</span>
      )}

      {visiblePages.map((page, index) => {
        const previousPage = visiblePages[index - 1];
        const showEllipsis = previousPage !== undefined && page - previousPage > 1;

        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-muted">…</span>}
            {page === currentPage ? (
              <span
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-accent px-3 text-sm font-medium text-white"
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link
                to={buildPageUrl(page)}
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border px-3 text-sm font-medium text-ink transition hover:bg-cream"
              >
                {page}
              </Link>
            )}
          </span>
        );
      })}

      {currentPage < totalPages ? (
        <Link to={buildPageUrl(currentPage + 1)} className="btn-secondary px-4 py-1.5">
          Sonraki
        </Link>
      ) : (
        <span className="btn-secondary cursor-not-allowed px-4 py-1.5 opacity-50">Sonraki</span>
      )}
    </nav>
  );
}
