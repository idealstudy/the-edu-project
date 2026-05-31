export const profileKeys = {
  all: ['profile'] as const,
  profile: (memberId?: string) => [...profileKeys.all, memberId] as const,
};
