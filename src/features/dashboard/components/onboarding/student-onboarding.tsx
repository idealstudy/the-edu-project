import { useEffect } from 'react';

import Link from 'next/link';

import { useStudentStudyRoomsQuery } from '@/features/study-rooms';
import { StudyRoomsQueryKey } from '@/features/study-rooms/api';
import { Icon } from '@/shared/components/ui/icon';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { useMemberStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';

import { useOnboardingStatus } from '../../hooks/use-onboarding-status';

export const StudentOnboarding = () => {
  const queryClient = useQueryClient();
  const member = useMemberStore((s) => s.member);

  // 역할에 따라 다른 쿼리 사용
  const { data: studentRooms } = useStudentStudyRoomsQuery();

  const rooms = studentRooms;
  const firstRoomId = rooms?.[0]?.id;

  // 주기적으로 쿼리를 무효화하여 실시간으로 완료 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      // 스터디룸 목록 쿼리 무효화 (다른 탭에서 스터디룸 생성 시 반영)
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.studentList,
      });
      // 수업노트 쿼리 무효화 (다른 탭에서 수업노트 작성 시 반영)
      if (firstRoomId) {
        queryClient.invalidateQueries({ queryKey: ['studyNotes'] });
        queryClient.invalidateQueries({ queryKey: ['qnaList'] });
      }
    }, 3000); // 3초마다 체크

    // 페이지 포커스 시에도 즉시 체크
    const handleFocus = () => {
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.studentList,
      });
      if (firstRoomId) {
        queryClient.invalidateQueries({ queryKey: ['studyNotes'] });
        queryClient.invalidateQueries({ queryKey: ['qnaList'] });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient, firstRoomId]);

  // 학생 온보딩 상태 조회
  const { hasRooms, hasNotes, hasQuestions, hasAssignments } =
    useOnboardingStatus({ rooms });

  // 학생의 수업노트 확인 여부
  const hasNotesViewed = hasNotes;

  const studentSteps = [
    {
      step: 1,
      title: '선생님 초대 받기',
      description: '선생님으로부터 초대 링크를 받아 스터디룸에 참여하세요',
      icon: Icon.Mail,
      action: '초대 링크 입력하기',
      href: '#', // TODO: 초대 링크 입력 페이지
      completed: hasRooms, // 스터디룸에 참여했으면 완료
      color: 'from-gray-scale-gray-1 to-gray-scale-gray-5',
    },
    {
      step: 2,
      title: '수업노트 확인하기',
      description: '선생님이 올려주신 수업 자료와 수업노트를 확인하세요',
      icon: Icon.Notebook,
      action: '수업노트 보기',
      href: hasRooms ? PRIVATE.ROOM.DETAIL(rooms?.[0]?.id ?? 0) : '#',
      completed: hasNotesViewed, // 학생의 경우 수업노트가 있으면 확인한 것으로 간주
      disabled: !hasRooms,
      color: 'from-orange-scale-orange-5 to-orange-scale-orange-10',
    },
    {
      step: 3,
      title: '과제 제출하기',
      description: '선생님이 내준 과제를 제출하고 피드백을 받으세요',
      icon: Icon.BookText,
      action: '과제 확인하기',
      href: '#', // TODO: 과제 목록 페이지
      completed: hasAssignments,
      disabled: !hasRooms,
      color: 'from-orange-scale-orange-10 to-orange-scale-orange-20',
    },
    {
      step: 4,
      title: '질문하기',
      description: '궁금한 점을 질문하고 선생님의 답변을 받으세요',
      icon: Icon.Question,
      action: '질문하기',
      href: '#', // TODO: 질문 작성 페이지
      completed: hasQuestions,
      disabled: !hasRooms,
      color: 'from-orange-scale-orange-20 to-orange-scale-orange-30',
    },
  ];

  const greeting = `${member?.name || ''} 학생님, 환영합니다!`;
  const subtitle = '선생님과 함께하는 학습 공간을 시작해보세요';

  const completedCount = studentSteps.filter((step) => step.completed).length;
  const totalSteps = studentSteps.length;

  return (
    <>
      <section className="rounded-[32px] bg-gradient-to-br from-[#ff4500] to-[#ff6b35] p-10 text-center text-white shadow-[0_24px_48px_rgba(255,72,5,0.35)]">
        <h1 className="mb-4 text-[32px] leading-[140%] font-bold tracking-[-0.04em]">
          {greeting}
          <br />
        </h1>
        <p className="mb-6 text-lg text-white/90">{subtitle}</p>
        {/* 진행률 표시 */}
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>진행률</span>
            <span className="font-semibold">
              {completedCount} / {totalSteps}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </section>
      <div className="space-y-4">
        {studentSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isCompleted = step.completed;
          const isLocked = index > 0 && !studentSteps[index - 1]?.completed;

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
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {/* 왼쪽: 단계 번호 배지 (순서 강조) */}
                <div className="flex shrink-0 items-center gap-4 md:w-32">
                  {isCompleted ? (
                    <div className="from-orange-scale-orange-40 to-orange-scale-orange-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-md">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-md',
                        step.color,
                        isLocked && 'opacity-50'
                      )}
                    >
                      <IconComponent
                        aria-hidden
                        className="text-orange-scale-orange-50 h-8 w-8"
                      />
                    </div>
                  )}
                  {/* 단계 번호 배지 - 순서 강조 */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-md',
                      isCompleted
                        ? 'bg-orange-scale-orange-50'
                        : isLocked
                          ? 'bg-gray-400'
                          : 'bg-[#ff4500]'
                    )}
                  >
                    {step.step}
                  </div>
                </div>

                {/* 가운데: 설명 */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3
                      className={cn(
                        'text-xl font-bold whitespace-nowrap md:text-2xl',
                        isCompleted
                          ? 'text-orange-scale-orange-60'
                          : isLocked
                            ? 'text-gray-400'
                            : 'text-gray-900'
                      )}
                    >
                      {step.title}
                    </h3>
                    {isCompleted && (
                      <span className="bg-orange-scale-orange-1 text-orange-scale-orange-60 rounded-full px-2 py-1 text-xs font-semibold">
                        완료
                      </span>
                    )}
                    {isLocked && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                        잠김
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm md:text-base',
                      isCompleted
                        ? 'text-orange-scale-orange-50'
                        : isLocked
                          ? 'text-gray-400'
                          : 'text-gray-600'
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                {/* 오른쪽: 액션 버튼 */}
                <div className="flex shrink-0 md:w-40">
                  {isCompleted ? (
                    <div className="bg-orange-scale-orange-1 text-orange-scale-orange-60 flex w-full items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold md:px-8 md:py-4 md:text-base">
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      완료됨
                    </div>
                  ) : isLocked ? (
                    <button
                      disabled
                      className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-400 md:px-8 md:py-4 md:text-base"
                    >
                      이전 단계 완료 필요
                    </button>
                  ) : step.href === '#' ? (
                    <button
                      disabled
                      className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-400 md:px-8 md:py-4 md:text-base"
                    >
                      준비 중
                    </button>
                  ) : (
                    <Link
                      href={step.href}
                      className="w-full rounded-lg bg-[#ff4500] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e64500] md:px-6 md:py-4 md:text-base"
                    >
                      {step.action}
                    </Link>
                  )}
                </div>
              </div>

              {/* 단계 사이 연결선 (모바일에서만) */}
              {index < studentSteps.length - 1 && (
                <div className="flex justify-center pt-2 md:hidden">
                  <div
                    className={cn(
                      'text-2xl',
                      studentSteps[index + 1]?.completed || step.completed
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
