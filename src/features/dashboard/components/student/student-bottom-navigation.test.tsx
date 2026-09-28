import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StudentBottomNavigation } from './student-bottom-navigation';

const navigationMocks = vi.hoisted(() => ({
  pathname: '/dashboard/student',
  rooms: [{ id: 31, name: '프로그램 수학' }],
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMocks.pathname,
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardStudyRoomListQuery: () => ({
    data: navigationMocks.rooms,
    isSuccess: true,
  }),
}));

describe('StudentBottomNavigation 모바일 안전 영역', () => {
  beforeEach(() => {
    navigationMocks.pathname = '/dashboard/student';
    navigationMocks.rooms = [{ id: 31, name: '프로그램 수학' }];
  });

  // Regression: REL-E-REMATCH-01. 390px 결과 화면에서 고정 내비가
  // 마지막 CTA를 덮었으므로 내비 자체가 기기 하단 안전 영역을 포함해야 한다.
  it('DESIGN 높이 토큰과 기기 safe-area를 함께 예약한다', () => {
    render(<StudentBottomNavigation />);

    expect(screen.getByTestId('student-bottom-navigation')).toHaveClass(
      'min-h-control-xl',
      'pb-[env(safe-area-inset-bottom)]',
      'shell:hidden'
    );
  });

  it('MOB-NAV-01 스터디룸이 있으면 6개 실제 라우트를 정해진 순서로 노출한다', () => {
    render(<StudentBottomNavigation />);

    const links = screen.getAllByRole('link');
    expect(links.map((item) => item.getAttribute('aria-label'))).toEqual([
      '학습',
      '교무실',
      '성과',
      '회고',
      '오답',
      '나',
    ]);
    expect(links.map((item) => item.getAttribute('href'))).toEqual([
      '/dashboard/student',
      '/study-rooms/31/note',
      '/dashboard/student/results',
      '/dashboard/student/look-back',
      '/dashboard/student/wrong-answers',
      '/mypage',
    ]);
    expect(screen.getByTestId('student-bottom-navigation')).toHaveClass(
      'grid-cols-6'
    );
    links.forEach((link) => expect(link).toHaveClass('min-h-control-xl'));
  });

  it('MOB-NAV-02 소속 스터디룸이 없으면 존재하지 않는 교무실 진입을 숨긴다', () => {
    navigationMocks.rooms = [];
    render(<StudentBottomNavigation />);

    expect(screen.queryByRole('link', { name: '교무실' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(5);
    expect(screen.getByTestId('student-bottom-navigation')).toHaveClass(
      'grid-cols-5'
    );
  });

  it('MOB-NAV-03 스터디룸 하위 화면에서 교무실 탭을 현재 위치로 표시한다', () => {
    navigationMocks.pathname = '/study-rooms/31/homework';
    render(<StudentBottomNavigation />);

    expect(screen.getByRole('link', { name: '교무실' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
