export const todoKeys = {
  all: ['todo'] as const,
  weekly: (weekOf?: string) =>
    [...todoKeys.all, 'weekly', weekOf ?? 'current'] as const,
};
