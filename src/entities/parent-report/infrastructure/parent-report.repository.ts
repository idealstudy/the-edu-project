import { type Child, type ChildReport } from '@/entities/parent-report/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './parent-report.dto';

/* ─────────────────────────────────────────────────────
 * [READ] 내 자녀 목록 조회
 *  GET /api/parent/children
 * ────────────────────────────────────────────────────*/
const getChildren = async (): Promise<Child[]> => {
  const response = await api.private.get('/parent/children');
  return unwrapEnvelope(response, dto.childrenList);
};

/* ─────────────────────────────────────────────────────
 * [READ] 자녀 학습 리포트 조회
 *  GET /api/parent/children/{childId}/report
 *  - from/to 미전달 시 백엔드가 최근 30일 기준으로 집계.
 * ────────────────────────────────────────────────────*/
const getChildReport = async (
  childId: number,
  params?: { from?: string; to?: string }
): Promise<ChildReport> => {
  const validated = params ? payload.reportRange.parse(params) : undefined;
  const response = await api.private.get(
    `/parent/children/${childId}/report`,
    validated ? { params: validated } : undefined
  );
  return unwrapEnvelope(response, dto.report);
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getChildren,
  getChildReport,
};
