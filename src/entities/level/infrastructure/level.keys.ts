/* ─────────────────────────────────────────────────────
 * 레벨·뱃지 Query Keys
 * ────────────────────────────────────────────────────*/
export const levelKeys = {
  all: ['level'] as const,
  me: () => [...levelKeys.all, 'me'] as const,
  badges: () => [...levelKeys.all, 'badges'] as const,
};
