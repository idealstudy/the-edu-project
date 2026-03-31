import { ConsultationStatus } from '@/entities/consultation/types';

export const consultationKeys = {
  all: ['consultation'] as const,
  detail: (id: number) => [...consultationKeys.all, 'detail', id] as const,
  myList: (params: { page: number; size: number }) =>
    [...consultationKeys.all, 'myList', params] as const,
  receivedList: (params: {
    page: number;
    size: number;
    status?: ConsultationStatus;
  }) => [...consultationKeys.all, 'receivedList', params] as const,
};
