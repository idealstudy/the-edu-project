import { ColumnSortOption } from '@/entities/column/types';

export const columnKeys = {
  all: ['column'] as const,
  list: (params: { page: number; size: number; sort: ColumnSortOption }) =>
    [...columnKeys.all, 'list', params] as const,
};
