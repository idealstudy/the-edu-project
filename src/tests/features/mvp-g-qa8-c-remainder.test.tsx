/**
 * QA 8차 C조 잔여 지적 + 제품 결함 B 회귀 테스트.
 * 기준: 승인 디자인 v22 (`prototypes/mvp-g-3역할-hub-opus.html`)
 *  - 3706~3709 선생님 마이페이지 `학생 초대 코드` · `코드 복사` · `링크로 보내기`
 *  - 2733 단권화 `가장 약한 단원 먼저 정리하기`
 *  - 제품 결함 B: "풀이를 이어서 진행해요" 안내에 이어 풀기 경로가 없던 것
 * 규칙(H4): 버튼이 보이는 것으로는 통과가 아니다. 눌렀을 때 실제 호출이 일어나야 한다.
 */
import { TeacherMyPage } from '@/features/dashboard/components/teacher/teacher-my-page';
import { MyProblemsSection } from '@/features/learning/components/my-problems-section';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rooms: vi.fn(),
  invitation: vi.fn(),
  toggleInvitation: vi.fn(),
  myChallenges: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/use-teacher-dashboard-query', () => ({
  useTeacherDashboardStudyRoomListQuery: mocks.rooms,
}));

vi.mock('@/features/study-rooms/hooks/use-invitation-query', () => ({
  useInvitationQuery: mocks.invitation,
}));

vi.mock('@/features/study-rooms/hooks/use-toggle-invitation', () => ({
  useToggleInvitation: () => ({
    mutate: mocks.toggleInvitation,
    isPending: false,
  }),
}));

vi.mock('@/shared/components/ui/bottom-toast', () => ({
  showBottomToast: vi.fn(),
}));

vi.mock(
  '@/features/mypage/open-challenge/hooks/use-my-open-challenges',
  () => ({
    useMyOpenChallenges: mocks.myChallenges,
    useMyOpenChallengeDetail: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
    }),
  })
);

describe('QA8 C조 잔여 + 제품 결함 B', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** userEvent.setup() 이 navigator.clipboard 를 자기 스텁으로 덮으므로 그 뒤에 심는다. */
  const setupUser = () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: mocks.writeText },
    });
    return user;
  };

  it('선생님 마이페이지 코드 복사가 실제로 클립보드에 초대 코드를 넣는다', async () => {
    const user = setupUser();
    mocks.rooms.mockReturnValue({
      data: [{ id: 41, name: '고3 수학', enrollmentStatus: 'OPERATING' }],
      isPending: false,
    });
    mocks.invitation.mockReturnValue({
      data: { enabled: true, token: 'abc-token-1234' },
      isPending: false,
    });

    render(<TeacherMyPage memberName="한지원" />);

    expect(screen.getByTestId('teacher-invite-code-value')).toHaveTextContent(
      'abc-token-1234'
    );
    await user.click(screen.getByTestId('teacher-invite-code-copy'));
    expect(mocks.writeText).toHaveBeenCalledWith('abc-token-1234');
  });

  it('링크로 보내기는 초대 링크를 공유하거나 복사한다', async () => {
    const user = setupUser();
    mocks.rooms.mockReturnValue({
      data: [{ id: 41, name: '고3 수학', enrollmentStatus: 'OPERATING' }],
      isPending: false,
    });
    mocks.invitation.mockReturnValue({
      data: { enabled: true, token: 'abc-token-1234' },
      isPending: false,
    });

    render(<TeacherMyPage memberName="한지원" />);
    await user.click(screen.getByTestId('teacher-invite-code-share'));

    expect(mocks.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/invite?token=abc-token-1234')
    );
  });

  it('초대 코드가 꺼져 있으면 이유와 켜기 경로를 함께 준다', () => {
    mocks.rooms.mockReturnValue({
      data: [{ id: 41, name: '고3 수학', enrollmentStatus: 'OPERATING' }],
      isPending: false,
    });
    mocks.invitation.mockReturnValue({
      data: { enabled: false, token: null },
      isPending: false,
    });

    render(<TeacherMyPage memberName="한지원" />);

    expect(screen.getByTestId('teacher-invite-code-copy')).toBeDisabled();
    expect(screen.getByTestId('teacher-invite-code-enable')).toBeEnabled();
  });

  it('시도 중인 문제 행에 이어 풀기 경로가 있다', () => {
    mocks.myChallenges.mockReturnValue({
      data: {
        content: [
          {
            challengeId: '901',
            questionText: '수열의 합을 구하시오.',
            sourceText: '2026 6월 모의고사',
            difficulty: 'HIGH',
            status: 'IN_PROGRESS',
            isCorrect: null,
            completedAt: null,
            questionImageUrl: null,
          },
        ],
        hasNext: false,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<MyProblemsSection />);

    expect(screen.getByTestId('my-problem-resume-901')).toHaveAttribute(
      'href',
      '/open-challenge/901'
    );
  });
});
