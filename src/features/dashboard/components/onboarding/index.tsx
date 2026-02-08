'use client';

import { Role } from '@/entities/member';

import { StudentOnboarding } from './student-onboarding';
import { TeacherOnboarding } from './teacher-onboarding';

interface DashboardOnboardingProps {
  role: Role;
}

/**
 * 첫 방문 사용자를 위한 온보딩 화면 (게임 퀘스트 스타일)
 * 각 단계의 완료 상태를 체크하고, 완료된 단계는 체크마크, 미완료는 버튼으로 표시
 */
export const DashboardOnboarding = ({ role }: DashboardOnboardingProps) => {
  const renderOnboarding = (role: Role) => {
    if (role === 'ROLE_TEACHER') {
      return <TeacherOnboarding />;
    }
    if (role === 'ROLE_STUDENT') {
      return <StudentOnboarding />;
    }
    return null;
  };

  return (
    <div className="bg-system-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pt-12 pb-24">
        {renderOnboarding(role)}

        {/* 추가 정보 */}
        <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 text-center md:p-8">
          <p className="mb-4 text-sm text-gray-600 md:text-base">
            <span className="font-semibold text-gray-900">
              궁금한 점이 있으신가요?
            </span>{' '}
            자주 묻는 질문을 확인하거나 고객 지원팀에 문의해주세요.
          </p>
          <a
            href="https://pf.kakao.com/_LMcpn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#FEE500]/90"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C4.48 0 0 3.84 0 8.58c0 2.88 1.84 5.42 4.64 6.96L3.5 20l5.14-2.78c.68.1 1.36.15 2.06.15 5.52 0 10-3.84 10-8.58S15.52 0 10 0z"
                fill="#3C1E1E"
              />
              <path
                d="M7.5 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                fill="#FEE500"
              />
            </svg>
            카카오톡 문의하기
          </a>
        </div>
      </div>
    </div>
  );
};
