/* ─────────────────────────────────────────────────────
 * 포인트 지갑 Query Keys
 * ────────────────────────────────────────────────────*/
export const pointKeys = {
  all: ['point'] as const,
  wallet: () => [...pointKeys.all, 'wallet'] as const,
};
