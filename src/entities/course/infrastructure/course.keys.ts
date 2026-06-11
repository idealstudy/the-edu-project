/* ─────────────────────────────────────────────────────
 * Query Keys — 코스
 * ────────────────────────────────────────────────────*/
export const courseKeys = {
  all: ['course'] as const,

  list: (page = 0, size = 10) =>
    [...courseKeys.all, 'list', { page, size }] as const,
  detail: (id: number) => [...courseKeys.all, 'detail', id] as const,
  lessons: (id: number) => [...courseKeys.all, 'lessons', id] as const,
};
