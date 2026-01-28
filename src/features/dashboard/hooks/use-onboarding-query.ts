import { onboardingKeys, repository } from '@/entities/onboarding';
import { useQuery } from '@tanstack/react-query';

const ONBOARDING_CHECK_INTERVAL = 3 * 1000; // 3초

export const useTeacherOnboardingQuery = () =>
  useQuery({
    queryKey: onboardingKeys.teacher(),
    queryFn: () => repository.teacher.getTeacherOnboarding(),
    staleTime: ONBOARDING_CHECK_INTERVAL,
    refetchInterval: ONBOARDING_CHECK_INTERVAL,
  });
