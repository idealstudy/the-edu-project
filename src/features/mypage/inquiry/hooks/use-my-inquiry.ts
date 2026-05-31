import { inquiryKeys, repository } from '@/entities/inquiry';
import { useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export const useMyInquiries = (page: number) =>
  useQuery({
    queryKey: inquiryKeys.myList({ page, size: PAGE_SIZE }),
    queryFn: () => repository.getMyInquiries({ page, size: PAGE_SIZE }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
