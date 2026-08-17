import { renderWithProviders } from '@/tests/utils';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FriendSafetyMenu } from './friend-safety-menu';

/* ────────────────────────────────────────────────────────
 * F-18 차단·신고 메뉴 — 서버가 유일한 진실원이므로 여기서는
 * "올바른 mutation이 올바른 인자로 호출되는가"만 확인한다.
 * ──────────────────────────────────────────────────────*/

const mocks = vi.hoisted(() => ({
  block: vi.fn(),
  unblock: vi.fn(),
  report: vi.fn(),
}));

vi.mock('@/features/social/hooks', () => ({
  useBlockFriendMutation: () => ({
    mutate: mocks.block,
    isPending: false,
  }),
  useUnblockFriendMutation: () => ({
    mutate: mocks.unblock,
    isPending: false,
  }),
  useReportFriendMutation: () => ({
    mutate: mocks.report,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

describe('FriendSafetyMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('메뉴를 열고 차단하기를 누르면 friendId로 차단 mutation을 호출한다', () => {
    renderWithProviders(
      <FriendSafetyMenu
        friendId={77}
        friendName="상혁"
      />
    );

    fireEvent.click(screen.getByLabelText('차단·신고 메뉴 열기'));
    fireEvent.click(screen.getByText('상혁님 차단하기'));

    expect(mocks.block).toHaveBeenCalledWith(77);
    expect(mocks.unblock).not.toHaveBeenCalled();
  });

  test('이미 차단된 상대는 차단 해제 버튼을 보여주고 해제 mutation을 호출한다', () => {
    renderWithProviders(
      <FriendSafetyMenu
        friendId={77}
        friendName="상혁"
        isBlocked
      />
    );

    fireEvent.click(screen.getByLabelText('차단·신고 메뉴 열기'));
    fireEvent.click(screen.getByText('차단 해제하기'));

    expect(mocks.unblock).toHaveBeenCalledWith(77);
  });

  test('신고하기를 누르면 사유 선택 다이얼로그가 뜨고 기타를 고르면 상세 입력 없이는 제출할 수 없다', () => {
    renderWithProviders(
      <FriendSafetyMenu
        friendId={77}
        friendName="상혁"
      />
    );

    fireEvent.click(screen.getByLabelText('차단·신고 메뉴 열기'));
    fireEvent.click(screen.getByText('신고하기'));

    expect(screen.getByText('상혁님 신고하기')).toBeInTheDocument();

    fireEvent.click(screen.getByText('기타'));
    const submitButton = screen.getByRole('button', { name: '신고 접수하기' });
    expect(submitButton).toBeDisabled();

    expect(mocks.report).not.toHaveBeenCalled();
  });

  test('사유를 고르고 제출하면 friendId·reason·detail로 신고 mutation을 호출한다', () => {
    renderWithProviders(
      <FriendSafetyMenu
        friendId={77}
        friendName="상혁"
      />
    );

    fireEvent.click(screen.getByLabelText('차단·신고 메뉴 열기'));
    fireEvent.click(screen.getByText('신고하기'));
    fireEvent.click(screen.getByText('괴롭힘·모욕'));
    fireEvent.click(screen.getByRole('button', { name: '신고 접수하기' }));

    expect(mocks.report).toHaveBeenCalledWith(
      {
        friendId: 77,
        body: { reason: 'HARASSMENT', detail: undefined },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});
