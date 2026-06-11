'use client';

import { parentReportKeys, repository } from '@/entities/parent-report';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 자녀 목록 조회 훅 (GET /api/parent/children)
 * ────────────────────────────────────────────────────*/
export const useChildrenQuery = () =>
  useQuery({
    queryKey: parentReportKeys.children(),
    queryFn: repository.getChildren,
  });

/* ─────────────────────────────────────────────────────
 * 자녀 학습 리포트 조회 훅
 *  GET /api/parent/children/{childId}/report
 *  - childId가 유효할 때만(NaN 방지) 요청.
 * ────────────────────────────────────────────────────*/
export const useChildReportQuery = (
  childId: number,
  params?: { from?: string; to?: string }
) =>
  useQuery({
    queryKey: parentReportKeys.report(childId, params),
    queryFn: () => repository.getChildReport(childId, params),
    enabled: Number.isFinite(childId) && childId > 0,
  });
