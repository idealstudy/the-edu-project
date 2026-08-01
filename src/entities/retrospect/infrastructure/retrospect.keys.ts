export const retrospectKeys = {
  all: ['retrospect'] as const,
  today: () => [...retrospectKeys.all, 'today'] as const,
  weekly: (weekOf?: string) =>
    [...retrospectKeys.all, 'weekly', weekOf ?? 'current'] as const,
};
