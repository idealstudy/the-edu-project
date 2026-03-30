import { consultationKeys, repository } from '@/entities/consultation';
import { useQuery } from '@tanstack/react-query';

export function useConsultation(id: number) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => repository.getConsultation(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
