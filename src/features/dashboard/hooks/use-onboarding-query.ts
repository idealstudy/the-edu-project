import { onboardingKeys, repository } from '@/entities/onboarding';
import { TeacherOnboardingStepType } from '@/entities/onboarding/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useTeacherOnboardingQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: onboardingKeys.teacher(),
    queryFn: () => repository.teacher.getTeacherOnboarding(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    enabled: options?.enabled,
  });

export const useTeacherOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TeacherOnboardingStepType) =>
      repository.teacher.saveTeacherOnboarding(status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: onboardingKeys.teacher() });
    },
  });
};
