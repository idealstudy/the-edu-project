import { ImpersonationBanner } from '@/features/impersonation/components/impersonation-banner';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ exit: vi.fn(), clearExpired: vi.fn() }));

vi.mock('@/features/impersonation/hooks/use-impersonation', () => ({
  clearExpiredImpersonationSession: mocks.clearExpired,
  useExitImpersonation: () => ({
    mutate: mocks.exit,
    isPending: false,
  }),
}));

describe('관리자 대신 보기 상단 배너 계약', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('IMP-UI-001 활성 세션은 대상과 30분 이내 남은 시간을 표시하고 복귀를 실행한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T00:00:00Z'));

    render(
      <ImpersonationBanner
        active
        memberName="김학생"
        expiresAt={Date.now() + 30 * 60 * 1000}
      />
    );

    expect(screen.getByTestId('impersonation-banner')).toHaveTextContent(
      '김학생님의 화면을 보고 있습니다. 최대 30분'
    );
    expect(screen.getByTestId('impersonation-banner')).toHaveTextContent(
      '남은 시간 30:00'
    );
    fireEvent.click(screen.getByRole('button', { name: '관리자로 돌아가기' }));
    expect(mocks.exit).toHaveBeenCalledWith();
  });

  test('IMP-UI-002 비활성 세션은 배너와 복귀 액션을 노출하지 않는다', () => {
    render(
      <ImpersonationBanner
        active={false}
        memberName=""
        expiresAt={0}
      />
    );

    expect(screen.queryByTestId('impersonation-banner')).toBeNull();
  });

  test('IMP-UI-003 30분 경계가 지나면 관리자 복귀 API 없이 세션 전건 소각으로 이동한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T00:00:00Z'));
    render(
      <ImpersonationBanner
        active
        memberName="김학생"
        expiresAt={Date.now() + 1000}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByTestId('impersonation-banner')).toBeNull();
    expect(mocks.exit).not.toHaveBeenCalled();
    expect(mocks.clearExpired).toHaveBeenCalledOnce();
  });
});
