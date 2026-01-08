'use client';

import React from 'react';

import { DashboardCompleted } from '@/features/dashboard/components/completed';
import { DashboardOnboarding } from '@/features/dashboard/components/onboarding';
import { useOnboardingStatus } from '@/features/dashboard/hooks/use-onboarding-status';
import {
  useStudentStudyRoomsQuery,
  useTeacherStudyRoomsQuery,
} from '@/features/study-rooms';
import { trackPageView } from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';

export const DashboardContainer = () => {
  const session = useMemberStore((s) => s.member);
  const role = session?.role;
  const isTeacher = role === 'ROLE_TEACHER';

  // 역할에 따라 다른 쿼리 사용
  const { data: teacherRooms, isLoading: isLoadingTeacher } =
    useTeacherStudyRoomsQuery({
      enabled: isTeacher,
    });
  const { data: studentRooms, isLoading: isLoadingStudent } =
    useStudentStudyRoomsQuery({
      enabled: !isTeacher,
    });

  const rooms = isTeacher ? teacherRooms : studentRooms;
  const isLoading = isTeacher ? isLoadingTeacher : isLoadingStudent;

  React.useEffect(() => {
    // 대시보드 페이지뷰 이벤트
    trackPageView('dashboard', {}, role ?? null);
  }, [role]);

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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="bg-system-background">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-center px-6 pt-12 pb-24">
          <div className="text-text-sub2 text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 온보딩 완료 여부 판단
  // 강사: 스터디룸, 학생 초대, 수업노트, 과제, 피드백
  // 학생: 스터디룸 참여, 수업노트 확인, 과제 제출, 질문
  const teacherStepsCompleted = [
    hasRooms, // 스터디룸 만들기
    hasStudents, // 학생 초대하기
    hasNotes, // 수업노트 작성하기
    hasAssignments, // 과제 부여하기
    hasFeedback, // 피드백 주기
  ];
  const studentStepsCompleted = [
    hasRooms, // 선생님 초대 받기
    hasNotes, // 수업노트 확인하기
    hasAssignments, // 과제 제출하기
    hasQuestions, // 질문하기
  ];

  const allStepsCompleted = isTeacher
    ? teacherStepsCompleted.every((completed) => completed)
    : studentStepsCompleted.every((completed) => completed);

  // 온보딩 완료 여부에 따라 다른 화면 표시
  if (!role) {
    return null; // 역할이 없으면 아무것도 표시하지 않음
  }

  // 온보딩 완료: 축하 화면 표시
  if (allStepsCompleted) {
    return <DashboardCompleted role={role} />;
  }

  // 온보딩 진행 중: 온보딩 화면 표시
  return <DashboardOnboarding role={role} />;
};
