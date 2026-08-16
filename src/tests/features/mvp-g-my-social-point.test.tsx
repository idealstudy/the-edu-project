import { StudentBottomNavigation } from '@/features/dashboard/components/student/student-bottom-navigation';
import { StudentMyPage } from '@/features/mypage/student/components/student-my-page';
import { PointWalletClient } from '@/features/point/components/point-wallet-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/mypage',
  basicInfo: vi.fn(),
  updateBasicInfo: vi.fn(),
  report: vi.fn(),
  rooms: vi.fn(),
  notes: vi.fn(),
  notifications: vi.fn(),
  updateNotification: vi.fn(),
  wallet: vi.fn(),
  solutionCost: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('@/features/mypage/common/hooks/student/use-basic-info', () => ({
  useStudentBasicInfo: mocks.basicInfo,
  useUpdateStudentBasicInfo: () => ({
    mutate: mocks.updateBasicInfo,
    isPending: false,
  }),
}));

vi.mock('@/features/mypage/profile/hooks/student/use-report', () => ({
  useStudentReport: mocks.report,
}));

vi.mock('@/features/mypage/profile/hooks/student/use-study-rooms', () => ({
  useStudentStudyRooms: mocks.rooms,
}));

vi.mock('@/features/mypage/profile/hooks/student/use-teaching-notes', () => ({
  useStudentTeachingNotes: mocks.notes,
}));

vi.mock('@/features/settings/hooks/use-notification', () => ({
  useNotificationSettings: mocks.notifications,
  useUpdateNotificationSetting: () => ({
    mutate: mocks.updateNotification,
    isPending: false,
    variables: undefined,
  }),
}));

vi.mock('@/features/point/hooks/use-point', () => ({
  useMyPointWalletQuery: mocks.wallet,
  useSolutionViewCostQuery: mocks.solutionCost,
}));

vi.mock('@/features/level', () => ({
  LevelBadgeConnected: () => <div data-testid="level-badge" />,
}));

describe('MVP-G 학생 마이와 포인트 계약', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = '/mypage';
    mocks.basicInfo.mockReturnValue({
      data: {
        name: '김서준',
        email: 'student@example.com',
        profileImageUrl: null,
        isProfilePublic: true,
        profilePublicKorean: '공개',
        learningGoal: '이번 주 오답 5개 다시 풀기',
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.report.mockReturnValue({
      data: {
        studyRoomCount: 2,
        questionCount: 3,
        submittedHomeworkCount: 4,
        totalHomeworkCount: 5,
        homeworkCompletionRate: 80,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.rooms.mockReturnValue({
      data: [
        {
          id: 17,
          name: '고2 수학',
          studentCount: 8,
          qnaCount: 2,
          teachingNoteCount: 6,
          state: 'APPROVED',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.notes.mockReturnValue({
      data: {
        content: [
          {
            id: 29,
            studyRoomId: 17,
            title: '수열 점화식 정리',
            studyRoomName: '고2 수학',
            teacherName: '한지원',
            taughtAt: '2026-08-14T10:00:00',
            visibility: 'PUBLIC',
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.notifications.mockReturnValue({
      data: [
        { category: 'ALL', enabled: true },
        { category: 'TEACHING_NOTE', enabled: true },
        { category: 'QNA', enabled: false },
        { category: 'INQUIRY', enabled: true },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.wallet.mockReturnValue({
      data: { balance: 120, transactions: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.solutionCost.mockReturnValue({
      data: { cost: 30, free: false, freeRemaining: 0 },
      isLoading: false,
      isError: false,
    });
  });

  it('학생 마이페이지는 실제 계정과 학습 데이터를 모두 표시한다', () => {
    render(<StudentMyPage />);

    expect(screen.getByRole('heading', { name: '마이페이지' })).toBeVisible();
    expect(screen.getByRole('link', { name: '프로필 수정' })).toHaveAttribute(
      'href',
      '/mypage?tab=profile'
    );
    expect(screen.getByText('김서준')).toBeVisible();
    expect(screen.getByText('이번 주 오답 5개 다시 풀기')).toBeVisible();
    expect(screen.getByText('수열 점화식 정리')).toBeVisible();
    expect(screen.getByText('고2 수학')).toBeVisible();
    expect(screen.getByLabelText('과제 완료율 80%')).toBeVisible();
    expect(screen.queryByText('서비스 알림 전체')).not.toBeInTheDocument();
    expect(screen.getByText('새 수업노트를 받으면 알려드려요.')).toBeVisible();
  });

  it('프로필 공개 토글은 기존 계정 값을 보존해 실제 변경 함수를 호출한다', async () => {
    const user = userEvent.setup();
    render(<StudentMyPage />);

    await user.click(screen.getByRole('switch', { name: '프로필 공개 켜짐' }));

    expect(mocks.updateBasicInfo).toHaveBeenCalledWith({
      name: '김서준',
      isProfilePublic: false,
      learningGoal: '이번 주 오답 5개 다시 풀기',
    });
  });

  it('포인트 화면은 잔액과 실제 해설 비용을 분리해 표시하고 학습 경로를 연결한다', () => {
    render(<PointWalletClient />);

    const balanceCard = screen.getByLabelText('포인트 잔액');
    expect(balanceCard).toHaveTextContent('120');
    expect(balanceCard).toContainElement(screen.getByTestId('level-badge'));
    expect(screen.getByText('30P')).toBeVisible();
    expect(screen.getByText('해설 1회 열람')).toBeVisible();
    expect(screen.getByText('혼자 다시 풀어 정답')).toBeVisible();
    expect(screen.getByText('오답을 스스로 고치면 적립')).toBeVisible();
    expect(screen.queryByText('가입 보너스')).not.toBeInTheDocument();
    expect(screen.queryByText('자력 정답')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '문제 보러 가기' })
    ).toHaveAttribute('href', '/dashboard/student/wrong-answers');
    expect(screen.getByRole('button', { name: '연결 전' })).toBeDisabled();
  });

  it('포인트가 부족하면 해설 이동 버튼을 비활성화한다', () => {
    mocks.wallet.mockReturnValue({
      data: { balance: 10, transactions: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PointWalletClient />);

    expect(screen.getByRole('button', { name: '포인트 부족' })).toBeDisabled();
  });
});

describe('MVP-G 학생 모바일 내비게이션', () => {
  it('다섯 화면의 실제 라우트와 현재 화면 상태를 제공한다', () => {
    mocks.pathname = '/friends';
    render(<StudentBottomNavigation />);

    expect(screen.getByRole('link', { name: '학습' })).toHaveAttribute(
      'href',
      '/dashboard/student'
    );
    expect(screen.getByRole('link', { name: '친구' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: '오답' })).toHaveAttribute(
      'href',
      '/dashboard/student/wrong-answers'
    );
    expect(screen.getByRole('link', { name: '포인트' })).toHaveAttribute(
      'href',
      '/points'
    );
    expect(screen.getByRole('link', { name: '마이' })).toHaveAttribute(
      'href',
      '/mypage'
    );
  });
});
