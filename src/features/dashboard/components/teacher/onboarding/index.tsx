import type { ComponentType } from 'react';
import { useState } from 'react';

import type { TeacherOnboardingStepType } from '@/entities/onboarding';
import { useTeacherOnboardingQuery } from '@/features/dashboard/hooks/use-onboarding-query';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ChatIcon,
  CoiledBookIcon,
  PenIcon,
  RoomIcon,
  UserPlusIcon,
} from '@/shared/components/icons';
import { Icon } from '@/shared/components/ui/icon';
import { cn } from '@/shared/lib';

import { OnboardingStep } from './onboarding-step';
import { OnboardingStepGroup } from './onboarding-step-group';

const TITLE_ONBOARDING_MOBILE = (
  <>
    먼저 나만의 스터디룸을 생성하고
    <br />
    학생을 초대해주세요
  </>
);
const TITLE_ONBOARDING_DESKTOP =
  '먼저 나만의 스터디룸을 생성하고 학생을 초대해주세요';

const TITLE_INVITE_STUDENT_COMPLETED =
  '이제 디에듀의 다양한 기능을 이용해보세요!';

const TeacherOnboarding = () => {
  const { data: onboarding } = useTeacherOnboardingQuery();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const getStepVariant = (stepType: string) => {
    const stepStatus =
      onboarding?.steps?.[stepType as keyof typeof onboarding.steps]?.status;
    if (stepStatus === 'completed') return stepStatus;
    else return 'incompleted';
  };

  const isInviteStudentCompleted =
    getStepVariant('INVITE_STUDENT') === 'completed';

  /** INVITE_STUDENT 완료 시에만 닫기 가능 */
  const canClose = isInviteStudentCompleted;
  /** INVITE_STUDENT 미완료 시 TITLE_ONBOARDING, 완료 시 TITLE_INVITE_STUDENT_COMPLETED */
  const title = isInviteStudentCompleted
    ? TITLE_INVITE_STUDENT_COMPLETED
    : null;

  if (!isVisible) return null;

  const titleClassName =
    'font-body1-heading tablet:font-headline1-heading text-orange-12 text-balance';

  return (
    <div className={cn('bg-orange-scale-orange-1 rounded-2xl p-8')}>
      <div className="flex w-full items-center justify-between gap-2 text-left">
        {title ? (
          <span className={titleClassName}>{title}</span>
        ) : (
          <>
            <span className={cn(titleClassName, 'tablet:hidden')}>
              {TITLE_ONBOARDING_MOBILE}
            </span>
            <span className={cn(titleClassName, 'tablet:inline hidden')}>
              {TITLE_ONBOARDING_DESKTOP}
            </span>
          </>
        )}
        <OnboardingCloseButton
          canClose={canClose}
          isExpanded={isExpanded}
          onClose={() => setIsVisible(false)}
          onExpandToggle={() => setIsExpanded((prev) => !prev)}
        />
      </div>

      <div
        className={cn(
          'mt-4 flex gap-2',
          'tablet:flex-row tablet:flex-wrap tablet:items-center flex-col',
          !isExpanded && 'tablet:flex hidden'
        )}
      >
        <OnboardingStep
          icon={ONBOARDING_STEPS[0].icon}
          label={ONBOARDING_STEPS[0].label}
          variant={getStepVariant(ONBOARDING_STEPS[0].type)}
        />
        <div className="tablet:contents flex justify-center py-1">
          <ArrowDownIcon className="text-orange-4 tablet:hidden" />
          <ArrowRightIcon className="text-orange-4 tablet:block hidden" />
        </div>
        <OnboardingStep
          icon={ONBOARDING_STEPS[1].icon}
          label={ONBOARDING_STEPS[1].label}
          variant={getStepVariant(ONBOARDING_STEPS[1].type)}
        />
        <div className="tablet:contents flex justify-center py-1">
          <ArrowDownIcon className="text-orange-4 tablet:hidden" />
          <ArrowRightIcon className="text-orange-4 tablet:block hidden" />
        </div>
        <OnboardingStepGroup className="tablet:flex-row flex-col">
          {ONBOARDING_STEPS.slice(2).map((step) => (
            <OnboardingStep
              key={step.type}
              icon={step.icon}
              label={step.label}
              variant={getStepVariant(step.type)}
              grouped
            />
          ))}
        </OnboardingStepGroup>
      </div>
    </div>
  );
};

/** 이미지 순서: 스터디룸 생성 → 학생 초대 → 수업노트 작성 → 질문 답변 → 과제 생성 */
const ONBOARDING_STEPS = [
  { type: 'CREATE_STUDY_ROOM', label: '스터디룸 생성', icon: RoomIcon },
  { type: 'INVITE_STUDENT', label: '학생 초대', icon: UserPlusIcon },
  { type: 'CREATE_CLASS_NOTE', label: '수업노트 작성', icon: CoiledBookIcon },
  { type: 'GIVE_FEEDBACK', label: '질문 답변', icon: ChatIcon },
  { type: 'ASSIGN_ASSIGNMENT', label: '과제 생성', icon: PenIcon },
] as const satisfies readonly {
  type: TeacherOnboardingStepType;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[];

interface OnboardingCloseButtonProps {
  canClose: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onExpandToggle: () => void;
}

const OnboardingCloseButton = ({
  canClose,
  isExpanded,
  onClose,
  onExpandToggle,
}: OnboardingCloseButtonProps) => (
  <>
    {canClose && (
      <button
        type="button"
        onClick={onClose}
        className="text-body2-normal text-gray-10 tablet:block hidden shrink-0"
      >
        닫기
      </button>
    )}
    <div className="tablet:hidden flex shrink-0">
      {canClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-10"
          aria-label="닫기"
        >
          <Icon.X className="size-6" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onExpandToggle}
          className="text-gray-10"
          aria-expanded={isExpanded}
          aria-label="접기/펼치기"
        >
          <Icon.ChevronDown
            className={cn(
              'text-gray-10 size-6 transition-transform',
              !isExpanded && 'rotate-180'
            )}
          />
        </button>
      )}
    </div>
  </>
);

export default TeacherOnboarding;
