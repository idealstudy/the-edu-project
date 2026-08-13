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

describe('FriendDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
