/* ─────────────────────────────────────────────────────
 * Query Keys — 공개 상담 사례 (consultation_case, 읽기 전용)
 * ────────────────────────────────────────────────────*/
export const consultationCaseKeys = {
  all: ['consultation-case'] as const,
  list: (page = 0, size = 10) =>
    [...consultationCaseKeys.all, 'list', { page, size }] as const,
  detail: (id: number) => [...consultationCaseKeys.all, 'detail', id] as const,
};
