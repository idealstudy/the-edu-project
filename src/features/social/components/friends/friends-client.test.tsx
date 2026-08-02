import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FriendsClient } from './friends-client';

const mockUseMyFriendsQuery = vi.fn();

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
});
