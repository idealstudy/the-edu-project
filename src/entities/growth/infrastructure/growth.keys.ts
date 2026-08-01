export const growthKeys = {
  all: ['growth'] as const,
  state: () => [...growthKeys.all, 'state'] as const,
};
