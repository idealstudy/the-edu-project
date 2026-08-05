import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOpenChallengeDetailQuery } from '../../hooks/use-open-challenge';
import { ChallengeSolveClient } from './challenge-solve-client';

/* ────────────────────────────────────────────────────────
 * 훅 모킹 — 실제 API 호출 없이 쿼리/뮤테이션 상태를 직접 주입
 * ──────────────────────────────────────────────────────*/

vi.mock('../../hooks/use-open-challenge', () => ({
  useOpenChallengeDetailQuery: vi.fn(),
  useCoachOpeningQuery: vi.fn(() => ({ data: undefined })),
  useMyOpenChallengeDetailQuery: vi.fn(() => ({ data: undefined })),
  useStartChallengeAttemptMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useSubmitChallengeAnswerMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useGuestGradeChallengeMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCreateChallengeReviewMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useFinishAiCoachingSessionMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
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

vi.mock('@/shared/components/drawing', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/drawing')>();
  return {
    ...actual,
    useDrawingUpload: vi.fn(() => ({
      uploadDrawingAsync: vi.fn(),
      isUploading: false,
    })),
    SolutionDrawingPad: () => null,
  };
});

vi.mock('@/shared/lib/analytics', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/analytics')>();
  return { ...actual, trackOcStart: vi.fn(), trackOcSubmit: vi.fn() };
});

vi.mock('./ai-coach-panel', () => ({
  AiCoachPanel: () => null,
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
});
