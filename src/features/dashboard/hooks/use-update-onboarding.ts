import { TeacherOnboardingStepType } from '@/entities/onboarding';

import {
  useTeacherOnboardingMutation,
  useTeacherOnboardingQuery,
} from '../../dashboard/hooks/use-onboarding-query';

export const useUpdateTeacherOnboarding = (
  stepType: TeacherOnboardingStepType
) => {
  const { data: onboarding } = useTeacherOnboardingQuery();

  const { mutate } = useTeacherOnboardingMutation();

  const sendOnboarding = () => {
    if (
      !onboarding ||
      onboarding.isCompleted ||
      onboarding.nextStep !== stepType
    )
      return;
    mutate(stepType);
  };

  return {
    sendOnboarding,
  };
};
