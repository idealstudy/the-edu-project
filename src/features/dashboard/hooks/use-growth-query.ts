import { growthKeys, repository } from '@/entities/growth';
import { useQuery } from '@tanstack/react-query';

export const useStudentGrowthQuery = () =>
  useQuery({
    queryKey: growthKeys.state(),
    queryFn: repository.getState,
  });
