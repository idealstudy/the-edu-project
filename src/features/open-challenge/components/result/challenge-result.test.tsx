import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  useChallengeReviewsQuery,
  useMyOpenChallengeDetailQuery,
  useNextChallengeQuery,
} from '../../hooks/use-open-challenge';
import { ChallengeResult } from './challenge-result';

/* ────────────────────────────────────────────────────────
 * 훅·하위 컴포넌트 모킹 — 결과화면 해설 섹션 렌더 여부만 검증한다.
 * ──────────────────────────────────────────────────────*/

vi.mock('../../hooks/use-open-challenge', () => ({
  useMyOpenChallengeDetailQuery: vi.fn(() => ({
    data: { attempts: [], reviews: [] },
    isLoading: false,
  })),
  useChallengeReviewsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useNextChallengeQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  useRecommendChallengeReviewMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCancelChallengeReviewRecommendMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/shared/lib/analytics', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/analytics')>();
  return { ...actual, trackOcComplete: vi.fn() };
});

vi.mock('@/features/social', () => ({
  ChallengeShareButton: () => null,
}));

vi.mock('./ai-feedback-form', () => ({ AiFeedbackForm: () => null }));
vi.mock('./challenge-reward', () => ({ ChallengeReward: () => null }));
vi.mock('./next-challenge-card', () => ({ NextChallengeCard: () => null }));

const CHALLENGE_ID = '4167';

const setSubmittedResult = (result: Record<string, unknown> | null) => {
  if (result === null) {
    window.sessionStorage.removeItem(`open-challenge-result:${CHALLENGE_ID}`);
    return;
  }
  window.sessionStorage.setItem(
    `open-challenge-result:${CHALLENGE_ID}`,
    JSON.stringify(result)
  );
};

describe('ChallengeResult (결과화면 해설 섹션)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(useMyOpenChallengeDetailQuery).mockReturnValue({
      data: { attempts: [], reviews: [] },
      isLoading: false,
    } as never);
    vi.mocked(useChallengeReviewsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
    vi.mocked(useNextChallengeQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
  });
  afterEach(() => cleanup());

  test('solutionText 가 있으면 해설 섹션을 보여준다', async () => {
    setSubmittedResult({
      isCorrect: true,
      correctAnswer: '3',
      passRate: 80,
      participantCount: 12,
      attemptId: 'attempt-1',
      solutionText: '이차방정식의 근의 공식을 이용해 풀이합니다.',
    });

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('정답 해설')).toBeInTheDocument();
    // MathMarkdown 은 DOMPurify 를 비동기 로드 후 렌더하므로 findBy 로 대기한다.
    expect(
      await screen.findByText(/근의 공식을 이용해 풀이합니다/)
    ).toBeInTheDocument();
  });

  test('solutionText 가 없으면(구버전 백엔드 등) 해설 섹션을 렌더하지 않는다', () => {
    setSubmittedResult({
      isCorrect: false,
      correctAnswer: '3',
      passRate: null,
      participantCount: 1,
      attemptId: 'attempt-2',
    });

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.queryByText('정답 해설')).not.toBeInTheDocument();
  });
});
