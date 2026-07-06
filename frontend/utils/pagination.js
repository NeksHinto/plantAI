export function paginateItems(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems: items.length,
  };
}

export function filterByQuery(items, query, fields) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? "").toLowerCase().includes(normalized)
    )
  );
}
