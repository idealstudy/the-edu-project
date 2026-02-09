export const teacherKeys = {
  all: ['teacher'] as const,
  basicInfo: () => [...teacherKeys.all, 'basicInfo'] as const,
};
