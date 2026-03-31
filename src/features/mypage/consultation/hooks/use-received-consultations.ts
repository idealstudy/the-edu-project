import {
  ConsultationStatus,
  consultationKeys,
  repository,
} from '@/entities/consultation';
import { useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export const useReceivedConsultations = (params: {
  page: number;
  status?: ConsultationStatus;
}) =>
  useQuery({
    queryKey: consultationKeys.receivedList({
      ...params,
      size: PAGE_SIZE,
    }),
    queryFn: () =>
      repository.getReceivedConsultations({
        ...params,
        size: PAGE_SIZE,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
