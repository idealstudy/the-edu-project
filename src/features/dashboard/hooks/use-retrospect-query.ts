import { growthKeys } from '@/entities/growth';
import {
  type RetrospectPayload,
  repository,
  retrospectKeys,
} from '@/entities/retrospect';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useTodayRetrospectQuery = () =>
  useQuery({
    queryKey: retrospectKeys.today(),
    queryFn: repository.getToday,
  });

export const useWeeklyRetrospectQuery = (weekOf?: string) =>
  useQuery({
    queryKey: retrospectKeys.weekly(weekOf),
    queryFn: () => repository.getWeekly(weekOf),
  });

export const useSaveRetrospect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      written,
      input,
    }: {
      written: boolean;
      input: RetrospectPayload;
    }) =>
      written ? repository.updateToday(input) : repository.createToday(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: retrospectKeys.all }),
        queryClient.invalidateQueries({ queryKey: growthKeys.all }),
      ]);
    },
  });
};
