export const adminOperationsKeys = {
  all: ['admin-operations'] as const,
  publicHall: () => [...adminOperationsKeys.all, 'public-hall'] as const,
  studyRooms: (params: object) =>
    [...adminOperationsKeys.all, 'study-rooms', params] as const,
  consultations: (params: object) =>
    [...adminOperationsKeys.all, 'consultations', params] as const,
  summary: () => [...adminOperationsKeys.all, 'summary'] as const,
};
