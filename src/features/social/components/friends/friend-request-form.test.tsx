import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FriendRequestForm } from './friend-request-form';

vi.mock('@/shared/components/ui', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/ui')>();
  return {
    ...actual,
    SearchInput: ({ 'aria-label': ariaLabel }: { 'aria-label'?: string }) => (
      <input
        role="searchbox"
        aria-label={ariaLabel}
      />
    ),
  };
});

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useRequestFriendMutation: () => ({ mutate: vi.fn(), isPending: false }),
    useRequestFriendByPhoneMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useSearchMembersQuery: () => ({ data: [], isFetching: false }),
  };
});

describe('FriendRequestForm', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('승인 시안의 친구 추가 행 문구로 접힌 상태를 렌더한다', () => {
    renderWithProviders(<FriendRequestForm />);

    expect(
      screen.getByRole('button', { name: /친구 추가하고 도전장 보내기/ })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByText('링크만 보내도 상대가 회원이 아니어도 풀 수 있습니다')
    ).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  test('친구 추가 행을 누르면 기존 이름과 전화번호 진입을 보존한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FriendRequestForm />);

    await user.click(
      screen.getByRole('button', { name: /친구 추가하고 도전장 보내기/ })
    );

    expect(screen.getByRole('searchbox', { name: '친구 검색' })).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: '친구 요청 대상 전화번호' })
    ).toBeVisible();
  });
});
