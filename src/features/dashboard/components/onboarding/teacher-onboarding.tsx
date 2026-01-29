import { useEffect } from 'react';

import { onboardingKeys } from '@/entities/onboarding/infrastructure/onboarding.keys';
import {
  useTeacherStudyRoomDetailQuery,
  useTeacherStudyRoomsQuery,
} from '@/features/study-rooms';
import { Icon } from '@/shared/components/ui/icon';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { useMemberStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';

import { useTeacherOnboardingQuery } from '../../hooks/use-onboarding-query';
import { OnboardingHeader } from './onboarding-header';
import { OnboardingStep } from './onboarding-step';

export const TeacherOnboarding = () => {
  const queryClient = useQueryClient();
  const member = useMemberStore((s) => s.member);
  // 강사 온보딩 상태 조회
  const { data: teacherOnboarding } = useTeacherOnboardingQuery();
  const { data: rooms } = useTeacherStudyRoomsQuery();

  const firstRoomId = rooms?.[0]?.id;

  // 스터디룸 상세 정보 조회 (강사용 - 학생 목록, 수업노트 수, 질문 수 확인)
  const { data: roomDetail } = useTeacherStudyRoomDetailQuery(
    firstRoomId ?? 0,
    {
      enabled: !!firstRoomId,
    }
  );

  const teacherHasRooms = rooms && rooms.length > 0;
  const teacherHasStudents =
    roomDetail?.studentNames && roomDetail.studentNames.length > 0;
  const steps = teacherOnboarding?.steps;

  // status: 'completed' | 'locked' | 'next'
  // disabled: locked와 별개로 처리합니다. next여도 disabled일 수 있습니다.
  const teacherSteps = [
    {
      step: 1,
      title: '스터디룸 만들기',
      description:
        '과목별, 반별로 스터디룸을 만들어 학생들을 체계적으로 관리하세요',
      icon: Icon.Notebook,
      action: '스터디룸 만들기',
      href: PRIVATE.ROOM.CREATE,
      status: steps?.CREATE_STUDY_ROOM?.status,
      color: 'from-orange-scale-orange-1 to-orange-scale-orange-5',
    },
    {
      step: 2,
      title: '학생 초대하기',
      description: '초대 링크로 학생을 우리만의 온라인 스터디룸에 초대하세요',
      icon: Icon.Person,
      action: '학생 초대하기',
      href: teacherHasRooms
        ? PRIVATE.ROOM.DETAIL(rooms?.[0]?.id ?? 0)
        : PRIVATE.ROOM.CREATE,
      status: steps?.INVITE_STUDENT?.status,
      disabled: !teacherHasRooms,
      color: 'from-gray-scale-gray-1 to-gray-scale-gray-5',
    },
    {
      step: 3,
      title: '수업노트 작성하기',
      description:
        '수업 전 예습 자료, 수업 후 복습 자료를 업로드하고 수업노트를 작성하세요',
      icon: Icon.BookText,
      action: '수업노트 쓰기',
      href: teacherHasRooms
        ? PRIVATE.NOTE.CREATE(rooms?.[0]?.id ?? 0)
        : PRIVATE.ROOM.CREATE,
      status: steps?.CREATE_CLASS_NOTE?.status,
      disabled: !teacherHasRooms,
      color: 'from-orange-scale-orange-5 to-orange-scale-orange-10',
    },
    {
      step: 4,
      title: '과제 부여하기',
      description: '학생들에게 과제를 내주고 자동 알림과 리마인더를 설정하세요',
      icon: Icon.BookQuestion,
      action: '과제 부여하기',
      href: '#',
      status: steps?.ASSIGN_ASSIGNMENT?.status,
      disabled: !teacherHasRooms || !teacherHasStudents,
      color: 'from-orange-scale-orange-10 to-orange-scale-orange-20',
    },
    {
      step: 5,
      title: '피드백 주기',
      description:
        '과제 피드백이나 질문 답변을 통해 학생들의 학습을 도와주세요',
      icon: Icon.Question,
      action: '피드백 주기',
      href: '#',
      status: steps?.GIVE_FEEDBACK?.status,
      disabled: !teacherHasRooms || !teacherHasStudents,
      color: 'from-orange-scale-orange-20 to-orange-scale-orange-30',
    },
  ];

  const greeting = `${member?.name || ''} 선생님, 환영합니다!`;
  const subtitle = `${teacherSteps.length}단계로 체계적인 수업 관리를 시작해보세요`;

  const completedCount = teacherSteps.filter(
    (step) => step.status === 'completed'
  ).length;
  const totalSteps = teacherSteps.length;

  // 페이지 포커스 시에도 즉시 체크
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.teacher(),
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);

  return (
    <>
      <OnboardingHeader
        greeting={greeting}
        subtitle={subtitle}
        completedCount={completedCount}
        totalSteps={totalSteps}
      />
      <div className="space-y-4">
        {teacherSteps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isLocked = step.status === 'locked';

          return (
            <div
              key={step.step}
              className={cn(
                'group relative rounded-2xl border-2 bg-white p-6 transition-all md:p-8',
                isCompleted
                  ? 'border-orange-scale-orange-30 bg-orange-scale-orange-1'
                  : isLocked
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-gray-200 hover:border-[#ff4500] hover:shadow-lg'
              )}
            >
              <OnboardingStep
                step={step.step}
                IconComponent={step.icon}
                status={step.status ?? 'locked'}
                title={step.title}
                description={step.description}
                action={step.action}
                href={step.href}
                color={step.color}
              />

              {/* 단계 사이 연결선 (모바일에서만) */}
              {index < teacherSteps.length - 1 && (
                <div className="flex justify-center pt-2 md:hidden">
                  <div
                    className={cn(
                      'text-2xl',
                      teacherSteps[index + 1]?.status === 'completed' ||
                        step.status === 'completed'
                        ? 'text-orange-scale-orange-30'
                        : 'text-gray-300'
                    )}
                  >
                    ↓
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
