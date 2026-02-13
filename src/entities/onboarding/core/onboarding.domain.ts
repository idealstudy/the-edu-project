import { dto } from '../infrastructure/onboarding.dto';
import type { TeacherOnboardingStepType } from '../types';

/* ─────────────────────────────────────────────────────
 * DTO 스키마를 Domain 스키마로 변환
 * ────────────────────────────────────────────────────*/
const TeacherOnboardingShape = dto.teacher;

/* ─────────────────────────────────────────────────────
 * Domain 스키마 (비즈니스 로직 포함)
 * - completedStepNumber: 완료된 스텝 수
 * - isCompleted: 온보딩 완료 여부
 * - steps: 단계(type, status: completed | next | locked)
 * ────────────────────────────────────────────────────*/
const STEP_ORDER: TeacherOnboardingStepType[] = [
  'CREATE_STUDY_ROOM',
  'INVITE_STUDENT',
  'CREATE_CLASS_NOTE',
  'ASSIGN_ASSIGNMENT',
  'GIVE_FEEDBACK',
];

const TeacherOnboardingSchema = TeacherOnboardingShape.transform(
  (onboarding) => {
    const completedStepNames = onboarding.completedSteps.map((s) => s.stepName);

    const getStatus = (stepType: TeacherOnboardingStepType) => {
      if (completedStepNames.includes(stepType)) return 'completed' as const;
      if (onboarding.nextStep != null && onboarding.nextStep === stepType)
        return 'next' as const;
      return 'locked' as const;
    };

    const steps = Object.fromEntries(
      STEP_ORDER.map((type) => [type, { status: getStatus(type) }])
    ) as Record<
      TeacherOnboardingStepType,
      { status: 'completed' | 'next' | 'locked' }
    >;

    return {
      ...onboarding,
      completedStepNumber: onboarding.currentProgress,
      isCompleted: onboarding.nextStep == null,
      steps,
    };
  }
);

export const domain = {
  schema: TeacherOnboardingSchema,
};
