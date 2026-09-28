import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MyOpenChallengeList } from './my-open-challenge-list';

const mocks = vi.hoisted(() => ({
  role: 'ROLE_STUDENT' as string | null,
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/mypage',
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams('tab=open-challenges'),
}));

vi.mock('@/providers/session/session-context', () => ({
  useSession: () => ({
    status: mocks.role ? 'authenticated' : 'loading',
    member: mocks.role ? { role: mocks.role } : null,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/features/mypage/open-challenge/hooks/use-my-open-challenges', () => ({
  useMyOpenChallenges: () => ({
    data: { content: [], hasNext: false },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe('D-034 마이페이지 문제 풀이 목록', () => {
  beforeEach(() => {
    mocks.role = 'ROLE_STUDENT';
    mocks.push.mockReset();
  });

  it('학생에게 공개 목록 진입과 제품명을 노출하지 않는다', () => {
    render(<MyOpenChallengeList />);

    expect(screen.getByText('내 문제 풀이 답안')).toBeVisible();
    expect(screen.queryByText(/오픈챌린지|응시장|포인트/)).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('역할 확정 전에도 공개 목록 진입과 제품명을 노출하지 않는다', () => {
    mocks.role = null;
    render(<MyOpenChallengeList />);

    expect(screen.getByText('내 문제 풀이 답안')).toBeVisible();
    expect(screen.queryByText(/오픈챌린지|응시장|포인트/)).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('선생님 화면의 기존 공개 목록 진입은 유지한다', () => {
    mocks.role = 'ROLE_TEACHER';
    render(<MyOpenChallengeList />);

    expect(screen.getByText('내 오픈챌린지 답안')).toBeVisible();
    expect(
      screen.getByRole('link', { name: '오픈챌린지 가기' })
    ).toHaveAttribute('href', '/');
  });
});
