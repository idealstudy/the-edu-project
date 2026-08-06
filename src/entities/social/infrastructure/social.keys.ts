/* ─────────────────────────────────────────────────────
 * Query Keys — 친구 / 도전장
 * ────────────────────────────────────────────────────*/
export const socialKeys = {
  all: ['social'] as const,

  friends: () => [...socialKeys.all, 'friends'] as const,
  turnSummary: () => [...socialKeys.friends(), 'turn-summary'] as const,
  friendSummary: (friendId: number) =>
    [...socialKeys.friends(), friendId, 'summary'] as const,
  friendMastery: (friendId: number) =>
    [...socialKeys.friends(), friendId, 'mastery'] as const,
  friendDuels: (friendId: number, cursor?: string) =>
    [...socialKeys.friends(), friendId, 'duels', cursor ?? 'first'] as const,

  memberSearch: (q: string) => [...socialKeys.all, 'member-search', q] as const,

  invitesAll: () => [...socialKeys.all, 'challenge-invites'] as const,
  myInvites: () => [...socialKeys.invitesAll(), 'me'] as const,
  invitePreview: (token: string) =>
    [...socialKeys.invitesAll(), 'preview', token] as const,
  inviteResult: (token: string) =>
    [...socialKeys.invitesAll(), 'result', token] as const,
};
