import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { MyChallengeInvites } from './my-challenge-invites';

const mockUseMyChallengeInvitesQuery = vi.fn();

// ChallengeShareButton 은 이 테스트 대상(상태별 CTA 노출)과 무관 — 공유 다이얼로그
// 내부 구현은 별도 테스트 소관이라 여기서는 라벨만 확인 가능한 스텁으로 대체한다.
vi.mock('./challenge-share-button', () => ({
  ChallengeShareButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
}));

// 결과 비교 다이얼로그 자체 렌더는 challenge-result-dialog 자체 테스트 소관 —
// 여기서는 "결과 보기" 클릭 시 열리는지만 확인 가능하게 마운트 여부만 스텁.
vi.mock('./challenge-result-dialog', () => ({
  ChallengeResultDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="result-dialog" /> : null,
}));

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useMyChallengeInvitesQuery: () => mockUseMyChallengeInvitesQuery(),
  };
});

/* ─────────────────────────────────────────────────────
 * 내 도전 기록 — invite 상태별 CTA 배선 검증.
 * (dev 재검수 회귀: COMPLETED 만 "결과 보기"가 뜨고 ACCEPTED 는 안 떠서
 *  실제로는 "결과 보기"가 거의 안 보인다는 지적 반영, 2026-08 배치)
 * ────────────────────────────────────────────────────*/
describe('MyChallengeInvites', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('OPEN 상태는 "도전장 보내기"가 주 CTA, "링크 복사"는 보조 아이콘 버튼으로 뜬다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 1,
          challengeId: 10,
          status: 'OPEN',
          shareToken: 'tok-open',
          regDate: '2026-08-01T00:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('도전장 보내기')).toBeInTheDocument();
    expect(screen.getByLabelText('도전장 링크 복사')).toBeInTheDocument();
    expect(screen.queryByText('결과 보기')).not.toBeInTheDocument();
  });

  test('ACCEPTED 상태는 "결과 보기"가 주 CTA로 뜬다(양측 결과가 존재할 수 있음)', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 2,
          challengeId: 11,
          status: 'ACCEPTED',
          shareToken: 'tok-accepted',
          regDate: '2026-08-01T00:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('결과 보기')).toBeInTheDocument();
    expect(screen.getByText('다시 도전')).toBeInTheDocument();
    expect(screen.queryByText('도전장 보내기')).not.toBeInTheDocument();
  });

  test('COMPLETED 상태도 "결과 보기"가 주 CTA로 뜬다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 3,
          challengeId: 12,
          status: 'COMPLETED',
          shareToken: 'tok-completed',
          regDate: '2026-08-01T00:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('결과 보기')).toBeInTheDocument();
  });

  test('"결과 보기" 클릭 시 결과 비교 다이얼로그가 열린다', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');

    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 4,
          challengeId: 13,
          status: 'COMPLETED',
          shareToken: 'tok-click',
          regDate: '2026-08-01T00:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.queryByTestId('result-dialog')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByText('결과 보기'));

    expect(screen.getByTestId('result-dialog')).toBeInTheDocument();
  });
});
