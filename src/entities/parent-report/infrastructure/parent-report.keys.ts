/* ─────────────────────────────────────────────────────
 * 학부모 리포트 Query Keys
 * ────────────────────────────────────────────────────*/
export const parentReportKeys = {
  all: ['parent-report'] as const,
  children: () => [...parentReportKeys.all, 'children'] as const,
  report: (childId: number, params?: { from?: string; to?: string }) =>
    [
      ...parentReportKeys.all,
      'report',
      childId,
      params?.from ?? null,
      params?.to ?? null,
    ] as const,
};
