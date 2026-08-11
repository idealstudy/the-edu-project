import FriendsPage from '@/app/(private)/friends/page';
import PointsPage from '@/app/(private)/points/page';
import TreePage from '@/app/(private)/tree/page';
import {
  DashboardAppHeader,
  studentAppBarTitle,
} from '@/features/dashboard/components/header/dashboard-app-header';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/dashboard/student',
  growthQuery: vi.fn(() => ({ data: { streakDays: 12, level: 7 } })),
  wrongAnswersQuery: vi.fn(() => ({ data: { totalCount: 6 } })),
  pointWalletQuery: vi.fn(() => ({ data: { balance: 320 } })),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('@/features/weakness-tree/components/weakness-tree-client', () => ({
  WeaknessTreeClient: () => <div data-testid="weakness-tree-content" />,
}));

vi.mock('@/features/social', () => ({
  FriendsClient: () => <div data-testid="friends-content" />,
  FriendsTutorial: () => <button type="button">친구 튜토리얼</button>,
}));

vi.mock('@/features/point/components/point-wallet-client', () => ({
  PointWalletClient: () => <div data-testid="point-wallet-content" />,
}));

vi.mock('@/features/dashboard/hooks/use-growth-query', () => ({
  useStudentGrowthQuery: mocks.growthQuery,
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useWrongAnswersQuery: mocks.wrongAnswersQuery,
}));

vi.mock('@/features/point/hooks/use-point', () => ({
  useMyPointWalletQuery: mocks.pointWalletQuery,
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
    mocks.growthQuery.mockClear();
    mocks.wrongAnswersQuery.mockClear();
    mocks.pointWalletQuery.mockClear();
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
    expect(studentAppBarTitle('/tree')).toBe('약점 트리');
  });

  it.each([
    ['/tree', '약점 트리', TreePage],
    ['/friends', '친구', FriendsPage],
    ['/points', '포인트', PointsPage],
  ])('%s에서 전역 헤더만 표시하고 요약 쿼리 3종을 호출하지 않는다', (pathname, title, Page) => {
    mocks.pathname = pathname;

    const { container } = render(
      <>
        <DashboardAppHeader
          role="ROLE_STUDENT"
          initialMemberName="김서준"
        />
        <Page />
      </>
    );

    expect(
      container.querySelectorAll('[data-dashboard-app-header]')
    ).toHaveLength(1);
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(mocks.growthQuery).not.toHaveBeenCalled();
    expect(mocks.wrongAnswersQuery).not.toHaveBeenCalled();
    expect(mocks.pointWalletQuery).not.toHaveBeenCalled();
  });

  it('스터디룸 상세 숫자 ID에만 상세 서브타이틀을 표시하고 new는 목록 요약을 유지한다', () => {
    mocks.pathname = '/study-rooms/new';
    const { rerender } = render(
      <DashboardAppHeader
        role="ROLE_TEACHER"
        initialMemberName="조성진"
      />
    );

    expect(screen.getByText('스터디룸 2개 · 학생 2명')).toBeVisible();
    expect(screen.queryByText('수업 상세 · 학생 화면 관리')).not.toBeInTheDocument();

    mocks.pathname = '/study-rooms/123/manage';
    rerender(
      <DashboardAppHeader
        role="ROLE_TEACHER"
        initialMemberName="조성진"
      />
    );

    expect(screen.getByText('수업 상세 · 학생 화면 관리')).toBeVisible();
  });
});
