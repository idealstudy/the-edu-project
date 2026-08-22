import { renderWithProviders } from '@/tests/utils';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FriendDetailClient } from './friend-detail-client';

const mocks = vi.hoisted(() => ({
  summary: vi.fn(),
  duels: vi.fn(),
  mastery: vi.fn(),
  myTree: vi.fn(),
  recommended: vi.fn(),
  requestFriend: vi.fn(),
  duelEnabled: vi.fn(),
  masteryEnabled: vi.fn(),
}));

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useFriendSummaryQuery: () => mocks.summary(),
    useFriendDuelsQuery: (
      _friendId: number,
      _cursor: string | undefined,
      options: { enabled?: boolean }
    ) => {
      mocks.duelEnabled(options?.enabled);
      return mocks.duels();
    },
    useFriendMasteryQuery: (
      _friendId: number,
      options: { enabled?: boolean }
    ) => {
      mocks.masteryEnabled(options?.enabled);
      return mocks.mastery();
    },
    useRequestFriendMutation: () => ({
      mutate: mocks.requestFriend,
      isPending: false,
      isSuccess: false,
    }),
  };
});

vi.mock('@/features/weakness-tree/hooks/use-tree', () => ({
  useMyTreeQuery: () => mocks.myTree(),
}));

vi.mock('@/features/open-challenge/hooks/use-open-challenge', () => ({
  useRecommendedChallengesQuery: () => mocks.recommended(),
}));

vi.mock('../challenge-invite/challenge-share-button', () => ({
  ChallengeShareButton: ({ label }: { label: string }) => (
    <button type="button">{label}</button>
  ),
}));

const friendSummary = {
  data: {
    friendId: 7,
    displayName: '철수',
    relation: 'FRIEND' as const,
    record: { win: 2, lose: 1, draw: 0, myTurn: 1 },
    brag: {
      conqueredUnitCount: 1,
      badgeCount: 2,
      streakDays: 3,
      level: 4,
      solvedCount: 20,
    },
  },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

const setMediaQueryMatches = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('FriendDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMediaQueryMatches(false);
    mocks.summary.mockReturnValue(friendSummary);
    mocks.duels.mockReturnValue({
      data: { items: [], nextCursor: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.mastery.mockReturnValue({
      data: { friendId: 7, units: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.myTree.mockReturnValue({
      data: { groups: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.recommended.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  test('관계 확인 전에는 친구 전용 대결과 정복 API를 호출하지 않는다', () => {
    mocks.summary.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendDetailClient friendId={7} />);

    expect(mocks.duelEnabled).toHaveBeenCalledWith(false);
    expect(mocks.masteryEnabled).toHaveBeenCalledWith(false);
  });

  test('낯선 사람의 친구 요청 버튼은 실제 친구 요청 mutation을 호출한다', () => {
    mocks.summary.mockReturnValue({
      ...friendSummary,
      data: { ...friendSummary.data, relation: 'NOT_FRIEND' as const },
    });

    renderWithProviders(<FriendDetailClient friendId={7} />);
    fireEvent.click(screen.getByRole('button', { name: '친구 요청 보내기' }));

    expect(mocks.requestFriend).toHaveBeenCalledWith({ addresseeId: 7 });
  });

  test('받침 없는 친구 이름 뒤 조사도 전적과 상세 문구에서 맞춘다', () => {
    mocks.summary.mockReturnValue({
      ...friendSummary,
      data: { ...friendSummary.data, displayName: '민서' },
    });

    renderWithProviders(<FriendDetailClient friendId={7} />);

    expect(screen.getByText('민서가 이김')).toBeInTheDocument();
    expect(screen.getByText('민서님과 한 대결')).toBeInTheDocument();
    expect(
      screen.getByText('민서님과는 아직 붙어본 적이 없어요')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/민서님은 아직 푼 문제가 적어요/)
    ).toBeInTheDocument();
  });

  test('대결과 양쪽 정복 지도 오류를 감추지 않고 각 재시도를 제공한다', () => {
    mocks.duels.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mocks.mastery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mocks.myTree.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendDetailClient friendId={7} />);

    expect(
      screen.getByRole('button', { name: '대결 기록 다시 시도' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: '친구 지도 다시 시도' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: '내 지도 다시 시도' })
    ).toBeVisible();
  });

  test('정복 지도는 확정 순서로 놓고 둘 다 진행 중인 단원에 도전장 행동을 붙인다', () => {
    mocks.mastery.mockReturnValue({
      data: {
        friendId: 7,
        units: [
          {
            nodeId: 1,
            displayName: '둘 다 완료',
            subjectName: '수학',
            masteryScore: 90,
          },
          {
            nodeId: 2,
            displayName: '상대만 진행',
            subjectName: '수학',
            masteryScore: 40,
          },
          {
            nodeId: 3,
            displayName: '둘 다 진행',
            subjectName: '수학',
            masteryScore: 55,
          },
          {
            nodeId: 4,
            displayName: '나만 진행',
            subjectName: '수학',
            masteryScore: 90,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.myTree.mockReturnValue({
      data: {
        groups: [
          {
            nodes: [
              { nodeId: '1', masteryScore: 90 },
              { nodeId: '2', masteryScore: 90 },
              { nodeId: '3', masteryScore: 35 },
              { nodeId: '4', masteryScore: 45 },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.recommended.mockReturnValue({
      data: [{ id: '99' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = renderWithProviders(
      <FriendDetailClient friendId={7} />
    );
    const text = container.textContent ?? '';

    expect(text.indexOf('둘 다 진행')).toBeLessThan(text.indexOf('나만 진행'));
    expect(text.indexOf('나만 진행')).toBeLessThan(text.indexOf('상대만 진행'));
    expect(text.indexOf('상대만 진행')).toBeLessThan(
      text.indexOf('둘 다 완료')
    );
    expect(screen.getByText('둘 다 정복 중')).toBeVisible();
    expect(
      screen.getByRole('button', { name: '둘 다 진행로 도전장 보내기' })
    ).toBeVisible();

    const opponentInProgress = screen.getByLabelText('철수 정복도 55%');
    const opponentComplete = screen.getAllByLabelText('철수 정복도 90%')[0];
    expect(opponentInProgress).toHaveClass('accent-gray-8');
    expect(opponentComplete).toHaveClass('accent-gray-10');
  });

  test('친구 상세는 자랑거리 다음에 정복 지도를 먼저, 대결 목록을 그다음에 둔다', () => {
    renderWithProviders(<FriendDetailClient friendId={7} />);

    const conquestMapHeading = screen.getByRole('heading', {
      name: '정복 지도',
    });
    const duelHistoryHeading = screen.getByRole('heading', {
      name: '철수님과 한 대결',
    });

    expect(
      conquestMapHeading.compareDocumentPosition(duelHistoryHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test('모바일 대결 메뉴는 대상 대결 이름이 있는 하단 모달 시트로 연다', async () => {
    setMediaQueryMatches(true);
    mocks.duels.mockReturnValue({
      data: {
        items: [
          {
            shareToken: 'share-1',
            status: 'COMPLETED',
            viewerCompleted: true,
            opponentSolvedAt: '2026-08-21T12:00:00Z',
            challengeId: 21,
            challengeTitle: '21. 함수의 극한과 연속',
            outcome: 'WIN',
            sentAt: '2026-08-20T12:00:00Z',
          },
        ],
        nextCursor: null,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendDetailClient friendId={7} />);
    fireEvent.click(screen.getByRole('button', { name: '대결 메뉴 열기' }));

    const sheet = await screen.findByRole('dialog');
    expect(sheet).toHaveTextContent('21. 함수의 극한과 연속');
    expect(sheet).toHaveTextContent('철수님과의 대결 메뉴');
    expect(sheet).toHaveClass('bottom-0');
  });
});
