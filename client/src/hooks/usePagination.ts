import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };

  const resetPage = () => setPage(1);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    goToPage,
    resetPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
