import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useOpenChallengeDetailQuery } from '../../hooks/use-open-challenge';
import { ChallengeSolveClient } from './challenge-solve-client';

const solveMocks = vi.hoisted(() => ({
  startAttemptAsync: vi.fn(),
  submitAnswerAsync: vi.fn(),
  createReviewAsync: vi.fn(),
  finishSessionAsync: vi.fn(),
  uploadDrawingAsync: vi.fn(),
}));

/* ────────────────────────────────────────────────────────
 * 훅 모킹 — 실제 API 호출 없이 쿼리/뮤테이션 상태를 직접 주입
 * ──────────────────────────────────────────────────────*/

vi.mock('../../hooks/use-open-challenge', () => ({
  useOpenChallengeDetailQuery: vi.fn(),
  useCoachOpeningQuery: vi.fn(() => ({ data: undefined })),
  useMyOpenChallengeDetailQuery: vi.fn(() => ({ data: undefined })),
  useStartChallengeAttemptMutation: vi.fn(() => ({
    mutateAsync: solveMocks.startAttemptAsync,
    isPending: false,
  })),
  useSubmitChallengeAnswerMutation: vi.fn(() => ({
    mutateAsync: solveMocks.submitAnswerAsync,
    isPending: false,
  })),
  useGuestGradeChallengeMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCreateChallengeReviewMutation: vi.fn(() => ({
    mutateAsync: solveMocks.createReviewAsync,
  })),
  useFinishAiCoachingSessionMutation: vi.fn(() => ({
    mutateAsync: solveMocks.finishSessionAsync,
    isPending: false,
  })),
}));

vi.mock('@/features/social/hooks', () => ({
  usePublicInvitePreviewQuery: vi.fn(() => ({ data: undefined })),
  useClaimGuestSessionMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/features/social', () => ({
  ChallengeShareButton: () => null,
}));

vi.mock('@/shared/components/drawing', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/drawing')>();
  return {
    ...actual,
    useDrawingUpload: vi.fn(() => ({
      uploadDrawingAsync: solveMocks.uploadDrawingAsync,
      isUploading: false,
    })),
    exportStrokesToDataURL: vi.fn(() => 'data:image/png;base64,test'),
    SolutionDrawingPad: ({
      onStrokesChange,
    }: {
      onStrokesChange?: (strokes: unknown[]) => void;
    }) => (
      <button
        type="button"
        data-testid="mock-draw-stroke"
        onClick={() =>
          onStrokesChange?.([
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
          ])
        }
      >
        획 그리기
      </button>
    ),
  };
});

vi.mock('@/shared/lib/analytics', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/analytics')>();
  return { ...actual, trackOcStart: vi.fn(), trackOcSubmit: vi.fn() };
});

vi.mock('./ai-coach-panel', () => ({
  AiCoachPanel: ({
    ensureAttempt,
  }: {
    ensureAttempt: () => Promise<string>;
  }) => (
    <button
      type="button"
      data-testid="mock-coach-ensure-attempt"
      onClick={() => void ensureAttempt()}
    >
      코치 시도 시작
    </button>
  ),
}));

const CHALLENGE_ID = '4167';

const baseChallenge = {
  id: 4167,
  subject: '수학',
  topic: '이차방정식',
  questionText: '다음 문제를 풀어보세요.',
  questionImageUrl: null,
  choices: ['1', '2', '3', '4'],
};

describe('ChallengeSolveClient (오픈챌린지 풀이 화면 가드)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    Object.values(solveMocks).forEach((mock) => mock.mockReset());
  });
  afterEach(() => cleanup());

  test('선택지가 없는 문제(주관식 등)는 풀이 UI 대신 미지원 안내를 보여준다', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: { ...baseChallenge, choices: [] },
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    expect(
      screen.getByText('아직 지원하지 않는 문제 유형이에요.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다른 문제 풀러가기' })
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('challenge-submit-button')
    ).not.toBeInTheDocument();
  });

  test('단답형(answerType=SHORT_ANSWER)은 choices가 비어있어도 미지원 안내 대신 답 입력칸을 보여준다', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: { ...baseChallenge, choices: [], answerType: 'SHORT_ANSWER' },
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    expect(screen.getByTestId('short-answer-input')).toBeInTheDocument();
    expect(
      screen.queryByText('아직 지원하지 않는 문제 유형이에요.')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('challenge-submit-button')).toBeInTheDocument();
  });

  test('단답형 제출 버튼은 빈 값일 때 비활성, 값을 입력하면 활성화된다', async () => {
    const user = userEvent.setup();
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: { ...baseChallenge, choices: [], answerType: 'SHORT_ANSWER' },
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    const submitButton = screen.getByTestId('challenge-submit-button');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('short-answer-input'), '42');

    expect(submitButton).not.toBeDisabled();
  });

  test('존재하지 않는 challengeId(404)는 에러 안내와 목록 CTA를 보여준다', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId="999999"
        isLoggedIn={false}
      />
    );

    expect(screen.getByText('문제를 찾을 수 없어요.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '문제 목록으로 가기' })
    ).toBeInTheDocument();
  });

  test('정상 문제는 기존처럼 선택지와 제출 버튼을 보여준다', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    expect(screen.getByTestId('challenge-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('choice-option-0')).toBeInTheDocument();
  });

  test('풀이 순서는 문제 다음 손풀이, 그다음 답 입력이다(CD-E-01)', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    const drawingHeading = screen.getByText('풀이 공간');
    const choiceHeading = screen.getByText('답을 직접 선택해 주세요');
    expect(
      drawingHeading.compareDocumentPosition(choiceHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test('손풀이 안내에 30일 뒤 실물 파기 고지가 있다(CD-E-05)', () => {
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn={false}
      />
    );

    expect(screen.getByText(/30일 뒤 이미지가/)).toBeInTheDocument();
  });

  test('손풀이 공유가 실패해도 결과를 저장하고 결과 화면 재시도 정보를 남긴다', async () => {
    const user = userEvent.setup();
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);
    solveMocks.startAttemptAsync.mockResolvedValue({ attemptId: 'attempt-1' });
    solveMocks.submitAnswerAsync.mockResolvedValue({
      isCorrect: true,
      correctAnswer: '1',
      passRate: 70,
      participantCount: 10,
    });
    solveMocks.uploadDrawingAsync.mockRejectedValue(
      new Error('presign failed')
    );

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn
      />
    );

    await user.click(screen.getByTestId('mock-draw-stroke'));
    await user.click(screen.getByTestId('choice-option-0'));
    await user.click(screen.getByTestId('challenge-submit-button'));

    await waitFor(() => {
      const raw = window.sessionStorage.getItem(
        `open-challenge-result:${CHALLENGE_ID}`
      );
      expect(raw).not.toBeNull();
      const stored = JSON.parse(raw ?? '{}') as {
        drawingShareFailure?: { strokes?: unknown[] };
      };
      expect(stored.drawingShareFailure?.strokes).toHaveLength(1);
    });
    expect(solveMocks.createReviewAsync).not.toHaveBeenCalled();
  });

  test('업로드 뒤 공유 생성 실패 시 숫자 미디어 ID를 재시도 정보에 보존한다', async () => {
    const user = userEvent.setup();
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);
    solveMocks.startAttemptAsync.mockResolvedValue({ attemptId: 'attempt-2' });
    solveMocks.submitAnswerAsync.mockResolvedValue({
      isCorrect: false,
      correctAnswer: '1',
      passRate: 70,
      participantCount: 10,
    });
    solveMocks.uploadDrawingAsync.mockResolvedValue({
      mediaId: 'media-uuid',
      mediaAssetId: 88,
    });
    solveMocks.createReviewAsync.mockRejectedValue(new Error('share failed'));

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn
      />
    );

    await user.click(screen.getByTestId('mock-draw-stroke'));
    await user.click(screen.getByTestId('choice-option-0'));
    await user.click(screen.getByTestId('challenge-submit-button'));

    await waitFor(() => {
      expect(solveMocks.createReviewAsync).toHaveBeenCalledWith({
        challengeId: CHALLENGE_ID,
        attemptId: 'attempt-2',
        solutionType: 'DRAWING',
        content: '',
        drawingImageMediaId: 88,
      });
    });
    const stored = JSON.parse(
      window.sessionStorage.getItem(`open-challenge-result:${CHALLENGE_ID}`) ??
        '{}'
    ) as { drawingShareFailure?: { mediaAssetId?: number } };
    expect(stored.drawingShareFailure?.mediaAssetId).toBe(88);
  });

  test('코치 첫 메시지와 답 제출이 겹쳐도 attempt 생성 요청은 하나를 공유한다', async () => {
    const user = userEvent.setup();
    vi.mocked(useOpenChallengeDetailQuery).mockReturnValue({
      data: baseChallenge,
      isLoading: false,
      isError: false,
    } as never);
    let resolveAttempt!: (value: { attemptId: string }) => void;
    solveMocks.startAttemptAsync.mockReturnValue(
      new Promise((resolve) => {
        resolveAttempt = resolve;
      })
    );
    solveMocks.submitAnswerAsync.mockResolvedValue({
      isCorrect: true,
      correctAnswer: '1',
      passRate: 70,
      participantCount: 10,
    });

    renderWithProviders(
      <ChallengeSolveClient
        challengeId={CHALLENGE_ID}
        isLoggedIn
      />
    );

    await user.click(screen.getByTestId('mock-coach-ensure-attempt'));
    await user.click(screen.getByTestId('choice-option-0'));
    await user.click(screen.getByTestId('challenge-submit-button'));

    expect(solveMocks.startAttemptAsync).toHaveBeenCalledTimes(1);
    resolveAttempt({ attemptId: 'shared-attempt' });

    await waitFor(() => {
      expect(solveMocks.submitAnswerAsync).toHaveBeenCalledWith({
        attemptId: 'shared-attempt',
        params: { selectedAnswer: '1' },
      });
    });
    expect(solveMocks.startAttemptAsync).toHaveBeenCalledTimes(1);
  });
});
