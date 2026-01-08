'use client';

import { Role } from '@/entities/member';
import { useMemberStore } from '@/store';

// import { DashboardCtx } from './dashboard-ctx';

interface DashboardCompletedProps {
  role: Role;
}

/**
 * 모든 온보딩 단계 완료 후 표시되는 통합 관리 화면
 * 질문/답변/피드백을 한번에 관리할 수 있는 대시보드
 */
export const DashboardCompleted = ({ role }: DashboardCompletedProps) => {
  const member = useMemberStore((s) => s.member);
  const isTeacher = role === 'ROLE_TEACHER';
  const userName = member?.name || (isTeacher ? ' 선생님' : ' 학생님');

  return (
    <div className="bg-system-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-12 pb-24">
        {/* 완료 축하 섹션 */}
        <section className="rounded-[32px] bg-gradient-to-br from-[#ff4500] to-[#ff6b35] p-10 text-center text-white shadow-[0_24px_48px_rgba(255,72,5,0.35)]">
          <div className="mb-6 text-6xl">🎉</div>
          <h1 className="mb-4 text-[32px] leading-[140%] font-bold tracking-[-0.04em]">
            모든 단계를 완료하셨습니다!
            <br />
          </h1>
          <p className="text-lg text-white/90">
            {userName}님, 이제 디에듀의 모든 기능을 활용할 준비가 되었어요
          </p>
        </section>

        {/* 추가 기능 안내 섹션 */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
          <div className="mb-3 text-4xl">✨</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            더 많은 기능이 곧 추가될 예정입니다
          </h2>
          <p className="text-sm text-gray-500">
            {isTeacher
              ? '통합 관리 대시보드, 학습 분석 리포트 등 유용한 기능들을 준비 중입니다'
              : '학습 통계, 목표 설정 등 학습을 더욱 체계적으로 관리할 수 있는 기능들을 준비 중입니다'}
          </p>
        </div>

        {/* 강사 전용 CTA 섹션 (선물처럼) */}
        {/* {isTeacher && <DashboardCtx />} */}
      </div>
    </div>
  );
};
