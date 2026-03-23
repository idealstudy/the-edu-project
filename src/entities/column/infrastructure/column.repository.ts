import { ColumnSortOption } from '@/entities/column/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './column.dto';

/* ─────────────────────────────────────────────────────
 * [Read] 칼럼 목록 조회 (공개, APPROVED만)
 * ────────────────────────────────────────────────────*/
const getList = async (params: {
  page: number;
  size: number;
  sort: ColumnSortOption;
}) => {
  const response = await api.public.get('/public/column-articles', { params });
  return unwrapEnvelope(response, dto.page);
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getList,
};
