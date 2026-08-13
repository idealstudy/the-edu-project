import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FriendsTutorial } from './friends-tutorial-dialog';

const mockUseMyFriendsQuery = vi.fn();

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useMyFriendsQuery: () => mockUseMyFriendsQuery(),
  };
});

const acceptedFriend = {
  id: 1,
  requesterId: 1,
  addresseeId: 2,
  state: 'ACCEPTED',
  regDate: null,
  requesterName: '나',
  requesterProfileImageUrl: null,
  addresseeName: '철수',
  addresseeProfileImageUrl: null,
};

const pendingRequest = {
  ...acceptedFriend,
  id: 2,
  state: 'PENDING',
};

describe('FriendsTutorial', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  test('수락된 친구가 0명이면 과거 열람 저장값과 관계없이 안내 창이 뜬다', () => {
    window.localStorage.setItem('dedu:friends-tutorial-seen', '1');
    mockUseMyFriendsQuery.mockReturnValue({ data: [], isLoading: false });

    renderWithProviders(<FriendsTutorial />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('1. 친구 추가하기')).toBeInTheDocument();
  });

  test('수락된 친구가 1명 이상이면 안내 창이 자동으로 뜨지 않는다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [acceptedFriend],
      isLoading: false,
    });

    renderWithProviders(<FriendsTutorial />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('수락 대기 요청만 있고 수락된 친구가 0명이면 안내 창이 뜬다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: [pendingRequest],
      isLoading: false,
    });

    renderWithProviders(<FriendsTutorial />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('친구 목록이 로딩 중이면 안내 창이 뜨지 않는다', () => {
    mockUseMyFriendsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<FriendsTutorial />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('수락된 친구가 있어도 다시 보기 링크를 누르면 안내 창이 뜬다', async () => {
    const user = userEvent.setup();
    mockUseMyFriendsQuery.mockReturnValue({
      data: [acceptedFriend],
      isLoading: false,
    });

    renderWithProviders(<FriendsTutorial />);

    await user.click(
      screen.getByRole('button', { name: '같이 풀기 튜토리얼 다시 보기' })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('1. 친구 추가하기')).toBeInTheDocument();
  });
});
