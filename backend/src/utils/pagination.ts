import type { PaginationRequestData } from '../../../shared/Shared.model';

export function getPagination(req: any): PaginationRequestData {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
  const sortBy = (req.query.sortBy as 'date' | 'name') || 'date';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  return {
    page, pageSize, sortBy, sortOrder,
  };
}

export function buildSort(sortBy: 'date' | 'name', sortOrder: 'asc' | 'desc') {
  if (sortBy === 'name') {
    return { name: sortOrder === 'asc' ? 1 : -1 };
  }
  // default 'date'
  return { date: sortOrder === 'asc' ? 1 : -1 };
}
