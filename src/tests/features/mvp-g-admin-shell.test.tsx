import { AdminShell } from '@/features/admin-operations/components/admin-shell';
import { useMemberStore } from '@/store';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/members',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/features/admin-operations/hooks/use-admin-operations', () => ({
  useAdminSummary: () => ({
    data: {
      totalMemberCount: 2400,
      newMemberCount: 37,
      consultationCount: 0,
      averageFirstResponseMinutes: null,
      activeStudyRoomCount: 0,
      challengeCount: 0,
      mostCommonConsultationCategory: '',
    },
  }),
}));

describe('MVP-G 관리자 셸 실제 값 결선', () => {
  afterEach(() => {
    useMemberStore.getState().clearMember();
  });

  test('세션 계정과 요약 API의 회원 수를 표시한다', () => {
    useMemberStore.getState().setMember({
      id: 1,
      email: 'real-admin@example.com',
      name: '실제 관리자',
      role: 'ROLE_ADMIN',
    });

    render(<AdminShell>본문</AdminShell>);

    expect(
      screen.getByText('실제 관리자 · real-admin@example.com')
    ).toBeInTheDocument();
    expect(screen.getByText('2,400명')).toBeInTheDocument();
    expect(screen.getByText('37명')).toBeInTheDocument();
    expect(screen.queryByText('admin@d-edu.site')).not.toBeInTheDocument();
  });
});
