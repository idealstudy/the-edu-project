export const profileKeys = {
  all: ['profile'] as const,
  myProfile: () => [...profileKeys.all, 'my'] as const,
};
