export const unitNoteKeys = {
  all: ['unit-note'] as const,
  library: () => [...unitNoteKeys.all, 'library'] as const,
  detail: (nodeId: number) => [...unitNoteKeys.all, 'detail', nodeId] as const,
};
