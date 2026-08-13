import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import DashboardParent from '@/features/dashboard/components/parent';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  connectedStudentsQuery: vi.fn(),
  navigationPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/parent',
  useRouter: () => ({
    push: mocks.navigationPush,
    replace: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch,
    ...props
  }: React.ComponentProps<'a'> & { prefetch?: boolean }) => {
    void prefetch;
    return (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          mocks.navigationPush(href);
        }}
      >
        {children}
      </a>
    );
  },
}));

vi.mock('@/shared/hooks/use-role', () => ({
  useRole: () => ({ role: 'ROLE_PARENT', isLoading: false }),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardStudyRoomListQuery: () => ({ data: [] }),
}));

vi.mock('@/features/dashboard/hooks/use-parent-dashboard-query', () => ({
  useParentDashboardConnectedStudentQuery: mocks.connectedStudentsQuery,
  useParentDashboardStudyNewsQuery: () => ({
    data: undefined,
    isPending: false,
  }),
  useParentDashboardStudyConsultationQuery: () => ({
    data: undefined,
    isPending: false,
  }),
  useParentDashboardInquiryListQuery: () => ({
    data: undefined,
    isPending: false,
  }),
}));

vi.mock('@/features/list', () => ({
  usePublicStudyRoomsQuery: () => ({
    data: { content: [] },
    isPending: false,
  }),
}));

vi.mock('@/features/dashboard/components/section/parent-link-section', () => ({
  ParentLinkSection: () => <section data-testid="parent-link-section" />,
}));

vi.mock(
  '@/features/dashboard/components/parent/weekly-reassurance-card',
  () => ({
    WeeklyReassuranceCard: () => (
      <section data-testid="weekly-reassurance-card" />
    ),
  })
);

vi.mock(
  '@/features/dashboard/components/section/parent-study-news-section',
  () => ({
    StudyNewsSection: () => <section data-testid="parent-study-news" />,
  })
);

vi.mock(
  '@/features/dashboard/components/section/parent-consultation-section',
  () => ({
    ConsultationSection: () => (
      <section data-testid="parent-study-room-records" />
    ),
  })
);

vi.mock(
  '@/features/dashboard/components/section/parent-studyroom-preview-section',
  () => ({
    StudyRoomPreviewSection: () => <section data-testid="parent-study-rooms" />,
  })
);

vi.mock(
  '@/features/dashboard/components/section/parent-class-consultation-history-section',
  () => ({
    ClassConsultationHistorySection: () => (
      <section data-testid="parent-consultations" />
    ),
  })
);

describe('MVP-G 학부모 hub v23 정합', () => {
  beforeEach(() => {
    mocks.connectedStudentsQuery.mockReset();
    mocks.navigationPush.mockReset();
    mocks.connectedStudentsQuery.mockReturnValue({
      data: [],
      isPending: false,
    });
  });

  it('학부모 사이드바는 정본 6항목만 순서대로 노출하고 클릭을 기존 라우트에 연결한다', async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar />);

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      '홈',
      '학습 소식',
      '스터디룸 기록일지',
      '스터디룸 둘러보기',
      '상담 내역',
      '마이페이지',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard/parent',
      '/dashboard/study-news',
      '/dashboard/study-consultation',
      '/list/study-rooms',
      '/dashboard/parent#parent-consultations',
      '/mypage',
    ]);
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'horizontal'
    );
    expect(screen.queryByText('자녀 학습')).not.toBeInTheDocument();

    for (const link of links) {
      await user.click(link);
    }
    expect(mocks.navigationPush.mock.calls.map(([href]) => href)).toEqual([
      '/dashboard/parent',
      '/dashboard/study-news',
      '/dashboard/study-consultation',
      '/list/study-rooms',
      '/dashboard/parent#parent-consultations',
      '/mypage',
    ]);
  });

  it('학생 미연결 상태에서는 학생 소식과 기록일지를 렌더하지 않고 공개·상담 섹션은 유지한다', () => {
    const { container } = render(<DashboardParent />);

    expect(
      container.querySelector('#parent-consultations')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('parent-study-news')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-study-room-records')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('parent-study-rooms')).toBeInTheDocument();
    expect(screen.getByTestId('parent-consultations')).toBeInTheDocument();
  });

  it('학생 연결 상태에서는 학습 소식과 기록일지를 기존 순서대로 렌더한다', () => {
    mocks.connectedStudentsQuery.mockReturnValue({
      data: [
        {
          studentId: 10,
          studentName: '민수',
          studyRooms: [],
        },
      ],
      isPending: false,
    });

    render(<DashboardParent />);

    expect(screen.getByTestId('parent-study-news')).toBeInTheDocument();
    expect(screen.getByTestId('parent-study-room-records')).toBeInTheDocument();
    expect(screen.getByTestId('parent-study-rooms')).toBeInTheDocument();
    expect(screen.getByTestId('parent-consultations')).toBeInTheDocument();
  });
});
