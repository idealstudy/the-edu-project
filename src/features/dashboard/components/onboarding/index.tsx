'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { Role } from '@/entities/member';
import { useOnboardingStatus } from '@/features/dashboard/hooks/use-onboarding-status';
import {
  useStudentStudyRoomsQuery,
  useTeacherStudyRoomsQuery,
} from '@/features/study-rooms';
import { Icon } from '@/shared/components/ui/icon';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { useMemberStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardOnboardingProps {
  role: Role;
}

/**
 * 첫 방문 사용자를 위한 온보딩 화면 (게임 퀘스트 스타일)
 * 각 단계의 완료 상태를 체크하고, 완료된 단계는 체크마크, 미완료는 버튼으로 표시
 */
export const DashboardOnboarding = ({ role }: DashboardOnboardingProps) => {
  const member = useMemberStore((s) => s.member);
  const isTeacher = role === 'ROLE_TEACHER';
  const queryClient = useQueryClient();

  // 역할에 따라 다른 쿼리 사용
  const { data: teacherRooms } = useTeacherStudyRoomsQuery({
    enabled: isTeacher,
  });
  const { data: studentRooms } = useStudentStudyRoomsQuery({
    enabled: !isTeacher,
  });

  const rooms = isTeacher ? teacherRooms : studentRooms;
  const firstRoomId = rooms?.[0]?.id;

  // 주기적으로 쿼리를 무효화하여 실시간으로 완료 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      // 스터디룸 목록 쿼리 무효화 (다른 탭에서 스터디룸 생성 시 반영)
      queryClient.invalidateQueries({ queryKey: ['teacherStudyRooms'] });
      queryClient.invalidateQueries({ queryKey: ['studentStudyRooms'] });
      // 수업노트 쿼리 무효화 (다른 탭에서 수업노트 작성 시 반영)
      if (firstRoomId) {
        queryClient.invalidateQueries({ queryKey: ['studyNotes'] });
        queryClient.invalidateQueries({ queryKey: ['qnaList'] });
      }
    }, 3000); // 3초마다 체크

    // 페이지 포커스 시에도 즉시 체크
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['teacherStudyRooms'] });
      queryClient.invalidateQueries({ queryKey: ['studentStudyRooms'] });
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

  // 온보딩 완료 여부 체크 (스터디룸 존재 여부만 확인)
  // TODO: 전체 조회 API가 생기면 상세 체크하도록 변경
  const {
    hasRooms,
    hasStudents,
    hasNotes,
    hasQuestions,
    hasAssignments,
    hasFeedback,
  } = useOnboardingStatus({ rooms });

  // 사용자 닉네임 (없으면 기본값)
  const userName = member?.name || (isTeacher ? ' 선생님' : ' 님');

  // 학생의 수업노트 확인 여부: 수업노트가 있으면 확인한 것으로 간주
  // (현재 API에 읽음 상태가 없으므로, 수업노트가 있으면 확인한 것으로 간주)
  // TODO: 실제 API에서 읽음 상태를 받아와야 함
  const hasNotesViewed = !isTeacher && hasNotes;

  const teacherSteps = [
    {
      step: 1,
      title: '스터디룸 만들기',
      description:
        '과목별, 반별로 스터디룸을 만들어 학생들을 체계적으로 관리하세요',
      icon: Icon.Notebook,
      action: '스터디룸 만들기',
      href: PRIVATE.ROOM.CREATE,
      completed: hasRooms,
      color: 'from-orange-100 to-orange-200',
    },
    {
      step: 2,
      title: '학생 초대하기',
      description: '초대 링크로 학생을 우리만의 온라인 스터디룸에 초대하세요',
      icon: Icon.Person,
      action: '학생 초대하기',
      href: hasRooms
        ? PRIVATE.ROOM.DETAIL(rooms?.[0]?.id ?? 0)
        : PRIVATE.ROOM.CREATE,
      completed: hasStudents,
      disabled: !hasRooms, // 스터디룸이 있어야 활성화
      color: 'from-blue-100 to-blue-200',
    },
    {
      step: 3,
      title: '수업노트 작성하기',
      description:
        '수업 전 예습 자료, 수업 후 복습 자료를 업로드하고 수업노트를 작성하세요',
      icon: Icon.BookText,
      action: '수업노트 작성하기',
      href: hasRooms
        ? PRIVATE.NOTE.CREATE(rooms?.[0]?.id ?? 0)
        : PRIVATE.ROOM.CREATE,
      completed: hasNotes,
      disabled: !hasRooms, // 스터디룸이 있어야 활성화
      color: 'from-green-100 to-green-200',
    },
    {
      step: 4,
      title: '과제 부여하기',
      description: '학생들에게 과제를 내주고 자동 알림과 리마인더를 설정하세요',
      icon: Icon.BookQuestion,
      action: '과제 부여하기',
      href: '#', // TODO: 과제 부여 페이지
      completed: hasAssignments,
      disabled: !hasRooms || !hasStudents,
      color: 'from-purple-100 to-purple-200',
    },
    {
      step: 5,
      title: '피드백 주기',
      description:
        '과제 피드백이나 질문 답변을 통해 학생들의 학습을 도와주세요',
      icon: Icon.Question,
      action: '피드백 주기',
      href: '#', // TODO: 피드백 페이지
      completed: hasFeedback,
      disabled: !hasRooms || !hasStudents,
      color: 'from-pink-100 to-pink-200',
    },
  ];

  const studentSteps = [
    {
      step: 1,
      title: '선생님 초대 받기',
      description: '선생님으로부터 초대 링크를 받아 스터디룸에 참여하세요',
      icon: Icon.Mail,
      action: '초대 링크 입력하기',
      href: '#', // TODO: 초대 링크 입력 페이지
      completed: hasRooms, // 스터디룸에 참여했으면 완료
      color: 'from-blue-100 to-blue-200',
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
      color: 'from-green-100 to-green-200',
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
      color: 'from-purple-100 to-purple-200',
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
      color: 'from-pink-100 to-pink-200',
    },
  ];

  const steps = isTeacher ? teacherSteps : studentSteps;
  const completedCount = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;

  const greeting = `${userName}님, 환영합니다!`;
  const subtitle = isTeacher
    ? `${totalSteps}단계로 체계적인 수업 관리를 시작해보세요`
    : '선생님과 함께하는 학습 공간을 시작해보세요';

  return (
    <div className="bg-system-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pt-12 pb-24">
        {/* 온보딩 헤더 */}
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

        {/* 단계별 가이드 (게임 퀘스트 스타일) */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = step.completed;
            const isLocked = index > 0 && !steps[index - 1]?.completed;

            return (
              <div
                key={step.step}
                className={cn(
                  'group relative rounded-2xl border-2 bg-white p-6 transition-all md:p-8',
                  isCompleted
                    ? 'border-green-300 bg-green-50/50'
                    : isLocked
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-200 hover:border-[#ff4500] hover:shadow-lg'
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  {/* 왼쪽: 단계 번호 배지 (순서 강조) */}
                  <div className="flex shrink-0 items-center gap-4 md:w-32">
                    {isCompleted ? (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-md">
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
                          className="h-8 w-8 text-gray-700"
                        />
                      </div>
                    )}
                    {/* 단계 번호 배지 - 순서 강조 */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-md',
                        isCompleted
                          ? 'bg-green-500'
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
                          'text-xl font-bold md:text-2xl',
                          isCompleted
                            ? 'text-green-700'
                            : isLocked
                              ? 'text-gray-400'
                              : 'text-gray-900'
                        )}
                      >
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
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
                          ? 'text-green-600'
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
                      <div className="flex w-full items-center justify-center rounded-lg bg-green-100 px-6 py-3 text-center text-sm font-semibold text-green-700 md:px-8 md:py-4 md:text-base">
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
                        className="w-full rounded-lg bg-[#ff4500] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e64500] md:px-8 md:py-4 md:text-base"
                      >
                        {step.action}
                      </Link>
                    )}
                  </div>
                </div>

                {/* 단계 사이 연결선 (모바일에서만) */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center pt-2 md:hidden">
                    <div
                      className={cn(
                        'text-2xl',
                        steps[index + 1]?.completed || step.completed
                          ? 'text-green-400'
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

        {/* 추가 정보 */}
        <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 text-center md:p-8">
          <p className="text-sm text-gray-600 md:text-base">
            <span className="font-semibold text-gray-900">
              궁금한 점이 있으신가요?
            </span>{' '}
            자주 묻는 질문을 확인하거나 고객 지원팀에 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};
