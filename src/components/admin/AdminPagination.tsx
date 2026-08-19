import type { JSX } from "react";

type AdminPaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
};

export const AdminPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "items",
}: AdminPaginationProps): JSX.Element | null => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalItems <= pageSize) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const pageNumbers: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-slate-800 px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
      <div>
        Showing <span className="font-bold text-slate-900 dark:text-white">{start}-{end}</span> of{" "}
        <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-lg font-bold transition ${
              page === currentPage
                ? "bg-[#1c05b3] text-white shadow-sm"
                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};
