/* ─────────────────────────────────────────────────────
 * Query Keys — 친구 / 도전장
 * ────────────────────────────────────────────────────*/
export const socialKeys = {
  all: ['social'] as const,

  friends: () => [...socialKeys.all, 'friends'] as const,

  invitesAll: () => [...socialKeys.all, 'challenge-invites'] as const,
  myInvites: () => [...socialKeys.invitesAll(), 'me'] as const,
  invitePreview: (token: string) =>
    [...socialKeys.invitesAll(), 'preview', token] as const,
  inviteResult: (token: string) =>
    [...socialKeys.invitesAll(), 'result', token] as const,
};
