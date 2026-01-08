export const profileKeys = {
  all: ['profile'] as const,
  myProfile: (userId?: string) => [...profileKeys.all, 'my', userId] as const,
};
