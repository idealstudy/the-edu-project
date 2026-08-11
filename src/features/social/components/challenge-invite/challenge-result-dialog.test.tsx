import { repository } from '@/entities/social';
import { PUBLIC } from '@/shared/constants';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ChallengeResultDialog } from './challenge-result-dialog';

const mockUseInviteResultQuery = vi.fn();

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useInviteResultQuery: () => mockUseInviteResultQuery(),
  };
});

const makeAxiosError = (data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status: 403,
    statusText: 'Forbidden',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

/* ─────────────────────────────────────────────────────
 * 결과 비교 다이얼로그. 컨닝 가드(CUNNING_GUARD_BLOCKED) 에러 처리 검증.
 * (회장 실측 결함: 서버가 "먼저 완료해야 볼 수 있다"는 정당한 사유를 줬는데
 *  화면이 "결과를 불러오지 못했어요/다시 시도"로 덮어써 엉뚱해 보였다.
 *  2026-08 배치. 서버 사유 그대로 노출 + 문제 풀러 가기 CTA.)
 * ────────────────────────────────────────────────────*/
describe('ChallengeResultDialog', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('CUNNING_GUARD_BLOCKED 이면 서버 사유를 그대로 보여주고 "문제 풀러 가기"를 제공한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: undefined,
      error: makeAxiosError({
        status: 403,
        message: '해당 문제를 먼저 완료해야 상대방 결과를 볼 수 있습니다',
        code: 'CUNNING_GUARD_BLOCKED',
      }),
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <ChallengeResultDialog
        token="tok"
        challengeId={42}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('해당 문제를 먼저 완료해야 상대방 결과를 볼 수 있습니다')
    ).toBeInTheDocument();
    // 내부 에러 코드는 화면에 노출되지 않는다
    expect(screen.queryByText(/CUNNING_GUARD_BLOCKED/)).not.toBeInTheDocument();
    expect(screen.getByText('문제 풀러 가기')).toBeInTheDocument();
    // "결과를 불러오지 못했어요"라는 무관한 문구로 덮지 않는다
    expect(
      screen.queryByText('결과를 불러오지 못했어요')
    ).not.toBeInTheDocument();
  });

  test('그 외 에러는 기존처럼 일반 실패 문구 + 다시 시도를 보여준다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: undefined,
      error: makeAxiosError({
        status: 404,
        message: '도전장을 찾을 수 없습니다.',
        code: 'INVITE_NOT_FOUND',
      }),
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <ChallengeResultDialog
        token="tok"
        challengeId={42}
        isOpen={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('결과를 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
    expect(screen.queryByText('문제 풀러 가기')).not.toBeInTheDocument();
  });

  test('서버 outcome과 갈린 지점을 사용하고 내려간 상대 풀이는 사유 문구로 표시한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        shareToken: 'tok',
        status: 'COMPLETED',
        challengeId: 42,
        outcome: 'LOSE',
        myCorrect: false,
        opponentCorrect: true,
        myAttempt: {
          isCorrect: false,
          selectedAnswer: '4',
          timeSpentSeconds: 108,
          solvedAt: '2026-08-06T08:41:00+09:00',
          solutionImageUrl: '/mine.png',
          solutionShared: true,
          solutionWithdrawn: false,
        },
        opponentAttempt: {
          isCorrect: true,
          selectedAnswer: '5',
          timeSpentSeconds: 252,
          solvedAt: '2026-08-05T21:40:00+09:00',
          solutionImageUrl: null,
          solutionShared: false,
          solutionWithdrawn: true,
        },
        divergence: {
          hasData: true,
          wrongType: 'CASE_OMITTED',
          reason: '(2,2)를 빠뜨렸어요.',
        },
        context: {
          inviterName: '조성진',
          sentAt: '2026-08-05T18:02:00+09:00',
          opponentSolvedAt: '2026-08-05T21:40:00+09:00',
        },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <ChallengeResultDialog
        token="tok"
        isOpen
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('졌어요. 어디서 갈렸는지 보고 가요')
    ).toBeInTheDocument();
    expect(screen.getByText('(2,2)를 빠뜨렸어요.')).toBeInTheDocument();
    expect(screen.getByText('상대가 풀이를 내렸어요')).toBeInTheDocument();
    expect(screen.getByText('조성진').closest('section')).not.toHaveClass(
      'border-key-color-primary'
    );
    // 라벨은 "실제로 가는 곳"과 일치해야 한다. 무필터 전체 목록으로 가므로 "문제 더 풀기".
    // (구 라벨 "이 유형 3문제"는 존재하지 않는 유형별 추천을 약속해 2026-08-11 코드리뷰에서 BLOCK 됐다.
    //  유형별 추천 API 가 생기면 라벨·링크·이 단언을 함께 되돌린다.)
    const practiceLink = screen.getByRole('link', {
      name: '문제 더 풀기',
    });
    expect(practiceLink).toHaveAttribute('href', PUBLIC.OPEN_CHALLENGE.LIST);
    expect(screen.queryByRole('link', { name: '이 유형 3문제' })).toBeNull();
    expect(screen.getByRole('button', { name: '다시 붙기' })).toHaveClass(
      'border-line-line2'
    );
  });

  test('내가 이긴 결과에서 다시 붙기를 누르면 rematch API mutation을 호출한다', async () => {
    const createRematch = vi
      .spyOn(repository, 'createRematch')
      .mockResolvedValue({
        shareToken: 'tok-next',
        challengeId: 77,
        challengeTitle: '경우의 수 새 문제',
        unitName: '경우의 수',
        rematchOfShareToken: 'tok-win',
      });
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        shareToken: 'tok-win',
        status: 'COMPLETED',
        challengeId: 42,
        outcome: 'WIN',
        myCorrect: true,
        opponentCorrect: false,
        myAttempt: null,
        opponentAttempt: null,
        divergence: null,
        context: { inviterName: '조성진' },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <ChallengeResultDialog
        token="tok-win"
        isOpen
        onOpenChange={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '다시 붙기' }));

    await waitFor(() => expect(createRematch).toHaveBeenCalledWith('tok-win'));
    expect(
      screen.getByText(/둘 다 약한 단원의 다른 문제를 고릅니다/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/선정 이유: 둘 다 약한 경우의 수에서/)
    ).toBeInTheDocument();
  });
});
