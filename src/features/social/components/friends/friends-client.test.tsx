import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FriendsClient } from './friends-client';

const mockUseMyFriendsQuery = vi.fn();
const mockUseFriendTurnSummaryQuery = vi.fn<() => { data: unknown }>(() => ({
  data: undefined,
}));
const mockUseFriendSummaryQuery = vi.fn<
  () => {
    data: unknown;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  }
>(() => ({
  data: undefined,
  isError: false,
  isLoading: false,
  refetch: vi.fn(),
}));

// FriendRequestForm 은 이 테스트 대상(상대방 이름·아바타 표시)과 무관 — 별도 아이콘
// 마크업이 jsdom 파서와 충돌하는 기존 이슈가 있어 여기서는 스텁으로 대체한다.
vi.mock('./friend-request-form', () => ({
  FriendRequestForm: () => null,
}));

vi.mock('@/providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers')>();
  return {
    ...actual,
    useSession: () => ({ member: { id: 1, role: 'ROLE_STUDENT' } }),
  };
});

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useMyFriendsQuery: () => mockUseMyFriendsQuery(),
    useFriendTurnSummaryQuery: () => mockUseFriendTurnSummaryQuery(),
    useFriendSummaryQuery: () => mockUseFriendSummaryQuery(),
    useAcceptFriendMutation: () => ({ mutate: vi.fn(), isPending: false }),
    useRequestFriendMutation: () => ({ mutate: vi.fn(), isPending: false }),
    useRequestFriendByPhoneMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useSearchMembersQuery: () => ({ data: [], isLoading: false }),
  };
});

/* ─────────────────────────────────────────────────────
 * 친구 목록 — "회원 #id" 대신 실제 이름/아바타를 렌더해야 한다.
 * (백엔드 FriendshipResponse 에 requester/addressee 이름·프로필 이미지 추가, 2026-08 배치)
 * ────────────────────────────────────────────────────*/
describe('FriendsClient', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseFriendTurnSummaryQuery.mockReturnValue({ data: undefined });
    mockUseFriendSummaryQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  test('친구(ACCEPTED) 목록에 상대방 닉네임이 "회원 #id" 대신 표시된다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 1,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(screen.getByText('철수')).toBeInTheDocument();
    expect(screen.queryByText(/회원 #/)).not.toBeInTheDocument();
  });

  test('상대방 이름이 없으면(null) 안전한 폴백 문구를 보여준다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 2,
          requesterId: 1,
          addresseeId: 4,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: null,
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(screen.getByText('이름 미설정 회원')).toBeInTheDocument();
  });

  test('받은 요청(PENDING, 내가 addressee)에서도 상대(requester) 이름을 표시한다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 3,
          requesterId: 5,
          addresseeId: 1,
          state: 'PENDING',
          regDate: null,
          requesterName: '영희',
          requesterProfileImageUrl: null,
          addresseeName: '나',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(screen.getByText('영희')).toBeInTheDocument();
  });

  test('내 차례인 대결이 있으면 맨 위에 강조 띠가 뜬다', () => {
    mockUseFriendTurnSummaryQuery.mockReturnValue({
      data: {
        myTurnCount: 2,
        oldest: {
          shareToken: 'tok',
          opponentName: '철수',
          challengeTitle: '확률과 통계 28번',
          receivedAt: '2026-08-11T21:12:00',
        },
      },
    });
    mockUseMyFriendsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(screen.getByText('내 차례인 대결 2건')).toBeInTheDocument();
    expect(screen.getByText(/철수님과의/)).toBeInTheDocument();
  });

  test('받은 요청과 친구가 섹션 분리 없이 한 목록에 이어 붙는다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 10,
          requesterId: 9,
          addresseeId: 1,
          state: 'PENDING',
          regDate: null,
          requesterName: '영희',
          requesterProfileImageUrl: null,
          addresseeName: '나',
          addresseeProfileImageUrl: null,
        },
        {
          id: 11,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    // 옛 구조는 "받은 요청"/"내 친구" 두 소제목으로 나눴다. 시안대로
    // 합친 목록엔 그 소제목이 없고 한 <ul> 안에 함께 나온다.
    expect(screen.queryByText('받은 요청')).not.toBeInTheDocument();
    expect(screen.getByText('영희')).toBeInTheDocument();
    expect(screen.getByText('철수')).toBeInTheDocument();
  });

  test('친구 전적 조회가 실패하면 무한 로딩 대신 재시도 버튼을 보여준다', () => {
    mockUseFriendSummaryQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 12,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(
      screen.getByRole('button', { name: '전적 다시 불러오기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '철수님과의 대결 기록 보기' })
    ).toHaveAttribute('href', '/friends/3');
    expect(screen.queryByText('대결 기록 불러오는 중')).not.toBeInTheDocument();
  });

  test('수락된 친구 행의 이름과 사진을 누르면 공개 프로필이 아니라 대결 상세로 간다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 13,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(
      screen.getByRole('link', { name: '철수님과의 대결 기록 보기' })
    ).toHaveAttribute('href', '/friends/3');
    expect(
      screen.queryByRole('link', { name: '철수 프로필 보기' })
    ).not.toBeInTheDocument();
  });

  test('서버 myTurn 친구를 맨 위로 정렬하고 오렌지 강조와 마지막 활동·우리 전적을 함께 보여준다', () => {
    mockUseFriendSummaryQuery.mockReturnValue({
      data: {
        record: { win: 3, lose: 2, draw: 1, myTurn: 1 },
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 20,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
          myTurn: false,
          lastActivity: {
            occurredAt: '2026-08-13T20:10:00',
            type: 'VIEWER_SUBMITTED',
          },
        },
        {
          id: 21,
          requesterId: 1,
          addresseeId: 4,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '민지',
          addresseeProfileImageUrl: null,
          myTurn: true,
          lastActivity: {
            occurredAt: '2026-08-13T21:40:00',
            type: 'OPPONENT_SUBMITTED',
          },
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('민지');
    expect(rows[0]).toHaveClass('border-orange-7', 'bg-orange-1');
    expect(rows[0]).toHaveTextContent('상대가 풀이를 냈어요');
    expect(rows[0]).not.toHaveTextContent('OPPONENT_SUBMITTED');
    expect(rows[0]).toHaveTextContent('3승 2패 1무');
    expect(rows[0]).toHaveTextContent('내 차례');
    expect(rows[1]).toHaveTextContent('철수');
  });

  test('사전에 없는 마지막 활동 코드는 친구 행에 표시하지 않는다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 22,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
          myTurn: false,
          lastActivity: {
            occurredAt: '2026-08-13T20:10:00',
            type: 'FUTURE_ACTIVITY',
          },
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(screen.getByText('철수')).toBeInTheDocument();
    expect(screen.queryByText(/FUTURE_ACTIVITY/)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  test('myTurn과 lastActivity가 없으면 기존 순서를 유지하고 강조와 활동 문구를 숨긴다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [
        {
          id: 30,
          requesterId: 1,
          addresseeId: 3,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '철수',
          addresseeProfileImageUrl: null,
        },
        {
          id: 31,
          requesterId: 1,
          addresseeId: 4,
          state: 'ACCEPTED',
          regDate: null,
          requesterName: '나',
          requesterProfileImageUrl: null,
          addresseeName: '민지',
          addresseeProfileImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('철수');
    expect(rows[1]).toHaveTextContent('민지');
    expect(rows[0]).toHaveClass('border-line-line2', 'bg-white');
    expect(rows[1]).toHaveClass('border-line-line2', 'bg-white');
    expect(screen.queryByText('내 차례')).not.toBeInTheDocument();
    expect(screen.queryByText(/풀이를 냈어요/)).not.toBeInTheDocument();
  });

  test('친구 0명 상태는 비회원도 풀 수 있다는 안내와 주 행동 하나를 제공한다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FriendsClient />);

    expect(
      screen.getByText(/친구가 회원이 아니어도 풀 수 있습니다/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '문제 골라 도전장 보내기' })
    ).toHaveAttribute('href', '/');
  });
});
