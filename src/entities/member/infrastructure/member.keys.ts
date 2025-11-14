export const memberKeys = {
  all: ['member'] as const,
  info: () => [...memberKeys.all, 'info'] as const,
};
