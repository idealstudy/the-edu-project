import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { MotiveHeader } from './motive-header';

/* ────────────────────────────────────────────────────────
 * 훅 모킹 — 실제 API 호출 없이 데이터를 주입
 * ──────────────────────────────────────────────────────*/

// useSession: 원본 모듈 보존 후 useSession만 교체
vi.mock('@/providers/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/session')>();
  return {
    ...actual,
    useSession: vi.fn(() => ({
      status: 'unauthenticated',
      member: null,
      error: null,
      refresh: vi.fn(),
    })),
  };
});

vi.mock('@/features/level', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/level')>();
  return {
    ...actual,
    useMyLevelQuery: vi.fn(() => ({
      data: { level: 3, exp: 140, expToNextLevel: 60, progressPercent: 70 },
    })),
  };
});

vi.mock('@/features/point/hooks/use-point', () => ({
  useMyPointWalletQuery: vi.fn(() => ({
    data: { balance: 230, transactions: [] },
  })),
}));

vi.mock('../../hooks/use-streak', () => ({
  useMyStreakQuery: vi.fn(() => ({
    data: { streakDays: 5, todayCompleted: false },
  })),
}));

vi.mock('@/shared/lib/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/analytics')>();
  return { ...actual, trackHomeView: vi.fn() };
});

/* ────────────────────────────────────────────────────────
 * 모킹된 모듈 참조 (top-level await 사용 불가 → 인라인 동기 import)
 * ──────────────────────────────────────────────────────*/
import { useSession } from '@/providers/session';
import { useMyStreakQuery } from '../../hooks/use-streak';

describe('MotiveHeader (홈 동기 헤더)', () => {
  afterEach(() => cleanup());

  test('비로그인 상태에서는 아무것도 렌더하지 않는다', () => {
    vi.mocked(useSession).mockReturnValueOnce({
      status: 'unauthenticated',
      member: null,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = renderWithProviders(<MotiveHeader />);
    expect(container.firstChild).toBeNull();
  });

  test('로그인 상태에서는 스트릭 · 레벨 · 포인트를 보여준다', () => {
    vi.mocked(useSession).mockReturnValueOnce({
      status: 'authenticated',
      member: { role: 'ROLE_STUDENT' } as never,
      error: null,
      refresh: vi.fn(),
    });

    renderWithProviders(<MotiveHeader />);

    expect(screen.getByText('5일 연속')).toBeInTheDocument();
    expect(screen.getByText('Lv.3')).toBeInTheDocument();
    expect(screen.getByText('230')).toBeInTheDocument();
  });

  test('streak=0일 때 "0일 연속"으로 보여준다 (첫 방문 안전)', () => {
    vi.mocked(useSession).mockReturnValueOnce({
      status: 'authenticated',
      member: null,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useMyStreakQuery).mockReturnValueOnce({
      data: { streakDays: 0, todayCompleted: false },
    } as never);

    renderWithProviders(<MotiveHeader />);

    expect(screen.getByText('0일 연속')).toBeInTheDocument();
  });
});
