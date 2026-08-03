import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
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
});
