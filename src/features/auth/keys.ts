export const AUTH_KEY = {
  all: ['auth'] as const,
  info: () => [...AUTH_KEY.all, 'info'] as const,
};
