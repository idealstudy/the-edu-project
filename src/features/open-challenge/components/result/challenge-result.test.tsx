import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  useChallengeReviewsQuery,
  useChallengeSolutionMutation,
  useMyOpenChallengeDetailQuery,
  useNextChallengeQuery,
  useOpenChallengeDetailQuery,
} from '../../hooks/use-open-challenge';
import { ChallengeResult } from './challenge-result';

const mutationMocks = vi.hoisted(() => ({
  createReviewAsync: vi.fn(),
  uploadDrawingAsync: vi.fn(),
}));

/* ────────────────────────────────────────────────────────
 * 훅·하위 컴포넌트 모킹 — 결과화면 크로스체크(문제+정오 비교 / 해설) 렌더 여부를 검증한다.
 * ──────────────────────────────────────────────────────*/

vi.mock('../../hooks/use-open-challenge', () => ({
  useMyOpenChallengeDetailQuery: vi.fn(() => ({
    data: { attempts: [], reviews: [] },
    isLoading: false,
  })),
  useOpenChallengeDetailQuery: vi.fn(() => ({
    data: undefined,
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
  useWithdrawChallengeReviewMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useCreateChallengeReviewMutation: vi.fn(() => ({
    mutateAsync: mutationMocks.createReviewAsync,
    isPending: false,
  })),
  // result-cross-check → solve/solution-panel 이 참조하는 훅(폴백 경로용). 이 스위트에선 호출 안 됨.
  useChallengeSolutionMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/shared/components/drawing', () => ({
  useDrawingUpload: vi.fn(() => ({
    uploadDrawingAsync: mutationMocks.uploadDrawingAsync,
    isUploading: false,
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

const CHALLENGE_DETAIL = {
  id: CHALLENGE_ID,
  subject: '수학',
  topic: '이차방정식',
  questionNumber: 12,
  questionText: 'x^2 - 5x + 6 = 0 의 해를 구하시오.',
  questionImageUrl: null,
  choices: ['1', '2', '3', '4', '5'],
  passRate: 80,
  wrongAnswerRate: 20,
  participantCount: 12,
  isAiSupported: true,
};

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

describe('ChallengeResult (결과화면 크로스체크)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mutationMocks.createReviewAsync.mockReset();
    mutationMocks.uploadDrawingAsync.mockReset();
    vi.mocked(useMyOpenChallengeDetailQuery).mockReturnValue({
      data: { attempts: [], reviews: [] },
      isLoading: false,
    } as never);
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: CHALLENGE_DETAIL,
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
    vi.mocked(useChallengeSolutionMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });
  afterEach(() => cleanup());

  test('solutionText 가 있으면 해설 섹션에 마크다운 본문을 보여준다', async () => {
    setSubmittedResult({
      isCorrect: true,
      correctAnswer: '3',
      passRate: 80,
      participantCount: 12,
      attemptId: 'attempt-1',
      selectedAnswer: '3',
      solutionText: '이차방정식의 근의 공식을 이용해 풀이합니다.',
    });

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('정답 해설')).toBeInTheDocument();
    // MathMarkdown 은 DOMPurify 를 비동기 로드 후 렌더하므로 findBy 로 대기한다.
    expect(
      await screen.findByText(/근의 공식을 이용해 풀이합니다/)
    ).toBeInTheDocument();
  });

  test('좌측 크로스체크에 내가 고른 답과 정답을 함께 보여준다', () => {
    setSubmittedResult({
      isCorrect: false,
      correctAnswer: '3',
      passRate: 60,
      participantCount: 8,
      attemptId: 'attempt-2',
      selectedAnswer: '2',
    });

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('내가 고른 답')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('solutionText 가 없으면(구버전 백엔드 등) 해설 대신 안내 문구를 보여준다', () => {
    setSubmittedResult({
      isCorrect: false,
      correctAnswer: '3',
      passRate: null,
      participantCount: 1,
      attemptId: 'attempt-3',
      selectedAnswer: '1',
    });

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('정답 해설')).toBeInTheDocument();
    expect(screen.getByText('해설을 아직 볼 수 없어요.')).toBeInTheDocument();
  });

  test('sessionStorage 가 비어있어도(새로고침) 완료 attempt 가 있으면 문제·정오로 폴백한다', () => {
    setSubmittedResult(null);
    vi.mocked(useMyOpenChallengeDetailQuery).mockReturnValue({
      data: {
        attempts: [
          {
            attemptId: 'attempt-9',
            status: 'COMPLETED',
            isCorrect: true,
            selectedAnswer: '3',
            usedAi: false,
            maxUsedHintStep: null,
            startedAt: null,
            completedAt: '2026-08-01T00:00:00',
          },
        ],
        reviews: [],
      },
      isLoading: false,
    } as never);

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('내가 고른 답')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(
      screen.getByText(
        '새로고침으로 방금 푼 해설이 사라졌어요. 아래에서 다시 확인할 수 있어요.'
      )
    ).toBeInTheDocument();
  });

  test('게스트가 sessionStorage 없이 진입하면 폴백 대신 안내 문구를 보여준다', () => {
    setSubmittedResult(null);

    renderWithProviders(
      <ChallengeResult
        challengeId={CHALLENGE_ID}
        isGuest
      />
    );

    expect(screen.getByText('결과를 다시 볼 수 없어요')).toBeInTheDocument();
    expect(screen.queryByText('정답 해설')).not.toBeInTheDocument();
  });

  test('손풀이 공유 실패를 알리고 다시 올리면 공유 생성 후 성공 상태로 바꾼다', async () => {
    const user = userEvent.setup();
    const strokes = [
      {
        id: 'stroke-1',
        pageNumber: 1,
        points: [
          { x: 0.1, y: 0.1 },
          { x: 0.2, y: 0.2 },
        ],
        color: '#111111',
        size: 3,
        tool: 'pen',
      },
    ];
    setSubmittedResult({
      isCorrect: true,
      correctAnswer: '2',
      passRate: 80,
      participantCount: 12,
      attemptId: 'attempt-10',
      selectedAnswer: '2',
      drawingShareFailure: { strokes },
    });
    mutationMocks.uploadDrawingAsync.mockResolvedValue({
      mediaId: 'media-uuid',
      mediaAssetId: 77,
    });
    mutationMocks.createReviewAsync.mockResolvedValue(undefined);

    renderWithProviders(<ChallengeResult challengeId={CHALLENGE_ID} />);

    expect(screen.getByText('손풀이를 올리지 못했어요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 올리기' }));

    await waitFor(() => {
      expect(mutationMocks.createReviewAsync).toHaveBeenCalledWith({
        challengeId: CHALLENGE_ID,
        attemptId: 'attempt-10',
        solutionType: 'DRAWING',
        content: '',
        drawingImageMediaId: 77,
      });
    });
    expect(screen.getByText('손풀이를 올렸어요.')).toBeInTheDocument();
    expect(
      screen.queryByText('손풀이를 올리지 못했어요')
    ).not.toBeInTheDocument();
  });
});
