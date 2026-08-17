import { renderWithProviders } from '@/tests/utils';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ChallengeListClient } from './challenge-list-client';

/* ────────────────────────────────────────────────────────
 * F-17 추천 유효성 fallback (빈 목록 / 요청 오류) — 픽셀이 아니라
 * "카드 대신 무엇을 보여주는가"만 검증한다.
 * ──────────────────────────────────────────────────────*/

const mocks = vi.hoisted(() => ({
  challengeList: vi.fn(),
  recommended: vi.fn(),
  refetchRecommended: vi.fn(),
}));

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    usePathname: () => '/challenges',
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
  };
});

vi.mock('../../hooks/use-open-challenge', () => ({
  useOpenChallengeListQuery: () => mocks.challengeList(),
  useRecommendedChallengesQuery: () => mocks.recommended(),
}));

vi.mock('@/shared/lib/analytics', () => ({
  trackOcLand: vi.fn(),
}));

describe('ChallengeListClient 추천 카드 fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.challengeList.mockReturnValue({ data: [], isLoading: false });
  });

  test('추천 후보가 0건이면 카드 대신 전체 탐색 안내를 보여준다', () => {
    mocks.recommended.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mocks.refetchRecommended,
    });

    renderWithProviders(
      <ChallengeListClient
        sort="latest"
        page={1}
      />
    );

    expect(screen.getByTestId('recommended-empty-state')).toBeInTheDocument();
    expect(
      screen.queryByTestId('recommended-error-state')
    ).not.toBeInTheDocument();
  });

  test('추천 요청이 실패하면 오류 안내와 재시도 버튼을 보여준다', () => {
    mocks.recommended.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mocks.refetchRecommended,
    });

    renderWithProviders(
      <ChallengeListClient
        sort="latest"
        page={1}
      />
    );

    expect(screen.getByTestId('recommended-error-state')).toBeInTheDocument();
    expect(
      screen.queryByTestId('recommended-empty-state')
    ).not.toBeInTheDocument();
  });

  test('유효 후보가 있으면 fallback 상태를 렌더하지 않는다', () => {
    mocks.recommended.mockReturnValue({
      data: [
        {
          id: 1,
          subject: 'MATH',
          difficulty: 'MID',
          wrongAnswerRate: 40,
          participantCount: 120,
          sourceText: '2026 6월 모의고사',
          questionImageUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: mocks.refetchRecommended,
    });

    renderWithProviders(
      <ChallengeListClient
        sort="latest"
        page={1}
      />
    );

    expect(
      screen.queryByTestId('recommended-empty-state')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('recommended-error-state')
    ).not.toBeInTheDocument();
  });
});
