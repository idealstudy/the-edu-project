import {
  DashboardAppHeader,
  studentAppBarTitle,
} from '@/features/dashboard/components/header/dashboard-app-header';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/dashboard/student',
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('@/features/dashboard/hooks/use-growth-query', () => ({
  useStudentGrowthQuery: () => ({ data: { streakDays: 12, level: 7 } }),
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useWrongAnswersQuery: () => ({ data: { totalCount: 6 } }),
}));

vi.mock('@/features/point/hooks/use-point', () => ({
  useMyPointWalletQuery: () => ({ data: { balance: 320 } }),
}));

vi.mock('@/features/dashboard/hooks/use-teacher-dashboard-query', () => ({
  useTeacherDashboardStudyRoomListQuery: () => ({
    data: [
      { id: 1, studentName: '김서준', todoCount: 4 },
      { id: 2, studentName: '박하윤', todoCount: 3 },
    ],
    isPending: false,
  }),
}));

vi.mock('@/features/dashboard/hooks/use-parent-dashboard-query', () => ({
  useParentDashboardReportQuery: () => ({
    data: {
      studyNews: 12,
      waitingInquiries: 1,
      answeredInquiries: 2,
      myStudentCount: 1,
    },
    isPending: false,
  }),
}));

describe('MVP-G 공통 앱 헤더', () => {
  beforeEach(() => {
    mocks.pathname = '/dashboard/student';
  });

  it('학생 경로가 바뀌어도 같은 헤더 셸 안에서 제목만 교체한다', () => {
    const { container, rerender } = render(
      <DashboardAppHeader
        role="ROLE_STUDENT"
        initialMemberName="김서준"
      />
    );

    expect(
      container.querySelectorAll('[data-dashboard-app-header]')
    ).toHaveLength(1);
    expect(screen.getByRole('heading', { name: '내 학습' })).toBeVisible();
    expect(screen.getByText('내 오답')).toBeVisible();

    mocks.pathname = '/dashboard/student/results';
    rerender(
      <DashboardAppHeader
        role="ROLE_STUDENT"
        initialMemberName="김서준"
      />
    );

    expect(
      container.querySelectorAll('[data-dashboard-app-header]')
    ).toHaveLength(1);
    expect(screen.getByRole('heading', { name: '내 성과' })).toBeVisible();
  });

  it('선생님 슬롯은 수업 수와 손볼 것 합계를 실제 쿼리 값으로 표시한다', () => {
    render(
      <DashboardAppHeader
        role="ROLE_TEACHER"
        initialMemberName="조성진"
      />
    );

    expect(screen.getByText('조성진 선생님')).toBeVisible();
    expect(screen.getByText('스터디룸 2개 · 학생 2명')).toBeVisible();
    expect(screen.getByText('7건')).toBeVisible();
  });

  it('학부모 슬롯은 역할 전용 카피와 리포트 지표를 같은 셸에서 표시한다', () => {
    render(
      <DashboardAppHeader
        role="ROLE_PARENT"
        initialMemberName="민수"
      />
    );

    expect(screen.getByText('민수 학부모님,')).toBeVisible();
    expect(screen.getAllByText('12개').length).toBeGreaterThan(0);
    expect(screen.getAllByText('매칭된 학생').length).toBeGreaterThan(0);
  });

  it('관리자 역할에는 기존 관리자 셸을 보존해 공통 헤더를 중복 렌더하지 않는다', () => {
    const { container } = render(
      <DashboardAppHeader
        role="ROLE_ADMIN"
        initialMemberName="관리자"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('경로 제목 매핑은 대시보드와 학습 경로를 같은 내 학습 제목으로 유지한다', () => {
    expect(studentAppBarTitle('/dashboard/student')).toBe('내 학습');
    expect(studentAppBarTitle('/learning')).toBe('내 학습');
    expect(studentAppBarTitle('/dashboard/student/exam-hall')).toBe('응시장');
  });
});
