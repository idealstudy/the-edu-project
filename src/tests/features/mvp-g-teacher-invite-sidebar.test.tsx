import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rooms: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/student',
}));

vi.mock('@/shared/hooks/use-role', () => ({
  useRole: () => ({ role: 'ROLE_STUDENT', isLoading: false }),
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardStudyRoomListQuery: mocks.rooms,
}));

vi.mock('@/shared/lib/analytics', () => ({
  trackGnbLogoutClick: vi.fn(),
}));

describe('MVP-G 학생 선생님 연결 사이드바 계약', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('TC-INV-006 유예 중이어도 미연결 학생은 선생님 연결 경로를 유지한다', () => {
    mocks.rooms.mockReturnValue({ data: [], isPending: false, isSuccess: true });

    render(<DashboardSidebar />);

    expect(screen.getByRole('link', { name: '선생님 연결' })).toHaveAttribute(
      'href',
      '/dashboard/connections'
    );
  });

  test('TC-INV-020 승인된 방이 생기면 선생님 연결 발행 경로를 숨긴다', () => {
    mocks.rooms.mockReturnValue({
      data: [{ id: 701, name: '김학생 학습방' }],
      isPending: false,
      isSuccess: true,
    });

    render(<DashboardSidebar />);

    expect(screen.queryByText('선생님 연결')).toBeNull();
    expect(screen.getByRole('link', { name: '김학생 학습방' })).toBeVisible();
  });

  test('TC-INV-020 조회 중에는 미연결로 오판해 발행 경로를 깜빡이지 않는다', () => {
    mocks.rooms.mockReturnValue({ data: undefined, isPending: true, isSuccess: false });

    render(<DashboardSidebar />);

    expect(screen.queryByText('선생님 연결')).toBeNull();
  });
});
