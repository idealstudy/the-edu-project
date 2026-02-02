export const onboardingKeys = {
  all: ['onboarding'] as const,
  teacher: () => [...onboardingKeys.all, 'teacher'] as const,
};
