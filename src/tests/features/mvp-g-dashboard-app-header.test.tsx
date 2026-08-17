import FriendsPage from '@/app/(private)/friends/page';
import LearningPage from '@/app/(private)/learning/page';
import PointsPage from '@/app/(private)/points/page';
import TreePage from '@/app/(private)/tree/page';
import {
  DashboardAppHeader,
  studentAppBarTitle,
} from '@/features/dashboard/components/header/dashboard-app-header';
import { renderWithProviders } from '@/tests/utils';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/dashboard/student',
  growthQuery: vi.fn(
    (): { data?: { streakDays?: number | null; level?: number | null } } => ({
      data: { streakDays: 12, level: 7 },
    })
  ),
  wrongAnswersQuery: vi.fn((): { data?: { totalCount?: number | null } } => ({
    data: { totalCount: 6 },
  })),
  pointWalletQuery: vi.fn((): { data?: { balance?: number | null } } => ({
    data: { balance: 320 },
  })),
  teacherRoomsQuery: vi.fn(
    (): {
      data?: Array<{
        id: number;
        studentName: string | null;
        todoCount: number;
      }>;
      isPending: boolean;
    } => ({
      data: [
        { id: 1, studentName: '김서준', todoCount: 4 },
        { id: 2, studentName: '박하윤', todoCount: 3 },
      ],
      isPending: false,
    })
  ),
  parentReportQuery: vi.fn(
    (): {
      data?: {
        studyNews: number;
        waitingInquiries: number;
        answeredInquiries: number;
        myStudentCount: number;
      };
      isPending: boolean;
    } => ({
      data: {
        studyNews: 12,
        waitingInquiries: 1,
        answeredInquiries: 2,
        myStudentCount: 1,
      },
      isPending: false,
    })
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  // /learning 화면 안쪽 부품이 라우터를 쓴다. 없으면 그 테스트만 라우터 없음으로 죽는다.
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/features/weakness-tree/components/weakness-tree-client', () => ({
  WeaknessTreeClient: () => <div data-testid="weakness-tree-content" />,
}));

vi.mock('@/features/social', () => ({
  FriendsClient: () => <div data-testid="friends-content" />,
  FriendsTutorial: () => <button type="button">친구 튜토리얼</button>,
  MyChallengeInvites: () => <div data-testid="challenge-invites-content" />,
}));

// 이 테스트는 전역 헤더의 h1 중복만 검증한다. LearningClient의 데이터 요청은
// 범위 밖이므로 실제 네트워크를 열지 않아 stderr를 회귀 신호로 깨끗하게 둔다.
vi.mock('@/features/learning', () => ({
  LearningClient: () => <div data-testid="learning-content" />,
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
  useTeacherDashboardStudyRoomListQuery: mocks.teacherRoomsQuery,
}));

vi.mock('@/features/dashboard/hooks/use-parent-dashboard-query', () => ({
  useParentDashboardReportQuery: mocks.parentReportQuery,
}));

describe('MVP-G 공통 앱 헤더', () => {
  beforeEach(() => {
    mocks.pathname = '/dashboard/student';
    mocks.growthQuery.mockClear();
    mocks.wrongAnswersQuery.mockClear();
    mocks.pointWalletQuery.mockClear();
    mocks.teacherRoomsQuery.mockClear();
    mocks.parentReportQuery.mockClear();
    mocks.growthQuery.mockReturnValue({
      data: { streakDays: 12, level: 7 },
    });
    mocks.wrongAnswersQuery.mockReturnValue({ data: { totalCount: 6 } });
    mocks.pointWalletQuery.mockReturnValue({ data: { balance: 320 } });
    mocks.teacherRoomsQuery.mockReturnValue({
      data: [
        { id: 1, studentName: '김서준', todoCount: 4 },
        { id: 2, studentName: '박하윤', todoCount: 3 },
      ],
      isPending: false,
    });
    mocks.parentReportQuery.mockReturnValue({
      data: {
        studyNews: 12,
        waitingInquiries: 1,
        answeredInquiries: 2,
        myStudentCount: 1,
      },
      isPending: false,
    });
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

  it('학생 요약 데이터가 없으면 네 값을 0 단위로 표시한다', () => {
    mocks.growthQuery.mockReturnValue({ data: undefined });
    mocks.wrongAnswersQuery.mockReturnValue({ data: undefined });
    mocks.pointWalletQuery.mockReturnValue({ data: undefined });

    render(
      <DashboardAppHeader
        role="ROLE_STUDENT"
        initialMemberName="김서준"
      />
    );

    expect(screen.getByText('0개')).toBeVisible();
    expect(screen.getByText('0일')).toBeVisible();
    expect(screen.getByText('Lv.0')).toBeVisible();
    expect(screen.getByText('0P')).toBeVisible();
  });

  it('선생님 지표 데이터가 없으면 0건을 표시한다', () => {
    mocks.teacherRoomsQuery.mockReturnValue({
      data: undefined,
      isPending: true,
    });

    render(
      <DashboardAppHeader
        role="ROLE_TEACHER"
        initialMemberName="조성진"
      />
    );

    expect(screen.getByText('스터디룸 0개 · 학생 0명')).toBeVisible();
    expect(screen.getByText('0건')).toBeVisible();
  });

  it('이름이 선생님으로 끝나면 접미를 중복하지 않는다', () => {
    render(
      <DashboardAppHeader
        role="ROLE_TEACHER"
        initialMemberName="정성 선생님"
      />
    );

    expect(screen.getByText('정성 선생님')).toBeVisible();
    expect(screen.queryByText('정성 선생님 선생님')).not.toBeInTheDocument();
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

  it('학부모 리포트 데이터가 없으면 네 통계칩을 0값으로 유지한다', () => {
    mocks.parentReportQuery.mockReturnValue({
      data: undefined,
      isPending: false,
    });

    render(
      <DashboardAppHeader
        role="ROLE_PARENT"
        initialMemberName="민수"
      />
    );

    expect(screen.getAllByText('0개').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0건')).toHaveLength(4);
    expect(screen.getAllByText('0명').length).toBeGreaterThan(0);
    expect(screen.getAllByText('학습 소식').length).toBeGreaterThan(0);
    expect(screen.getAllByText('답변 대기').length).toBeGreaterThan(0);
    expect(screen.getAllByText('답변 완료').length).toBeGreaterThan(0);
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

  // 2026-08-11: /learning 이 아래 목록에 없어서 제목 중복을 못 잡았다.
  // 전역 헤더가 "내 학습"을 그리는데 페이지도 h1 으로 또 그려 dev 화면에 두 번 보였고,
  // 코드와 테스트만 보고는 안 잡혀 화면을 눈으로 보고서야 발견했다.
  // 이 화면은 학습 허브라 요약 쿼리를 실제로 쓰므로 아래 목록에 넣지 않고 제목 중복만 따로 못박는다.
  it('/learning 에서 화면 제목이 전역 헤더 하나뿐이다 (페이지가 또 그리지 않는다)', () => {
    mocks.pathname = '/learning';

    // 이 화면은 조회 도구를 실제로 쓰므로 공용 래퍼로 감싼다.
    renderWithProviders(
      <>
        <DashboardAppHeader
          role="ROLE_STUDENT"
          initialMemberName="김서준"
        />
        <LearningPage />
      </>
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it.each([
    ['/tree', '약점 트리', TreePage],
    ['/friends', '친구', FriendsPage],
    ['/points', '포인트', PointsPage],
  ])(
    '%s에서 전역 헤더만 표시하고 요약 쿼리 3종을 호출하지 않는다',
    (pathname, title, Page) => {
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
      expect(
        screen.getByRole('heading', { name: title, level: 1 })
      ).toBeVisible();
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(mocks.growthQuery).not.toHaveBeenCalled();
      expect(mocks.wrongAnswersQuery).not.toHaveBeenCalled();
      expect(mocks.pointWalletQuery).not.toHaveBeenCalled();
    }
  );

  it('/friends는 사람 목록만 조합하고 문제 단위 내 도전 기록을 렌더하지 않는다', () => {
    mocks.pathname = '/friends';

    render(
      <>
        <DashboardAppHeader
          role="ROLE_STUDENT"
          initialMemberName="김서준"
        />
        <FriendsPage />
      </>
    );

    expect(screen.getByTestId('friends-content')).toBeVisible();
    expect(
      screen.queryByTestId('challenge-invites-content')
    ).not.toBeInTheDocument();
    // 2026-08-18: PR #521(mvp-g 친구 좌우 열 정합)이 친구 페이지 본문에 h2 "친구" 를 추가했다.
    // 그래서 앱 헤더 h1 과 본문 h2 로 같은 이름의 제목이 둘이 된다.
    // 이 테스트의 원래 의도는 "친구 화면에 문제 단위 도전 기록이 섞이지 않는다" 이고
    // 제목 개수는 그 의도의 대리 지표였으므로, 의도가 유지되도록 레벨로 나눠 확인한다.
    // 같은 이름 제목이 둘 보이는 것이 옳은지는 그 화면을 소유한 라인이 판단할 일이라 여기서 정하지 않는다.
    expect(
      screen.getByRole('heading', { name: '친구', level: 1 })
    ).toBeVisible();
    expect(screen.getAllByRole('heading', { name: '친구' })).toHaveLength(2);
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
    expect(
      screen.queryByText('수업 상세 · 학생 화면 관리')
    ).not.toBeInTheDocument();

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
