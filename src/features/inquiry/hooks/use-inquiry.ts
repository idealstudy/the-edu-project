import { inquiryKeys, repository } from '@/entities/inquiry';
import { useQuery } from '@tanstack/react-query';

export function useInquiry(id: number) {
  return useQuery({
    queryKey: inquiryKeys.detail(id),
    queryFn: () => repository.getInquiry(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
