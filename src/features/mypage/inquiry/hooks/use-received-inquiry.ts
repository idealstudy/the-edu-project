import { InquiryStatus, inquiryKeys, repository } from '@/entities/inquiry';
import { useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export const useReceivedInquiries = (params: {
  page: number;
  status?: InquiryStatus;
}) =>
  useQuery({
    queryKey: inquiryKeys.receivedList({
      ...params,
      size: PAGE_SIZE,
    }),
    queryFn: () =>
      repository.getReceivedInquiries({
        ...params,
        size: PAGE_SIZE,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
