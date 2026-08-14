import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StudentBottomNavigation } from './student-bottom-navigation';

const navigationMocks = vi.hoisted(() => ({
  pathname: '/dashboard/student',
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMocks.pathname,
}));

describe('StudentBottomNavigation 모바일 안전 영역', () => {
  beforeEach(() => {
    navigationMocks.pathname = '/dashboard/student';
  });

  // Regression: REL-E-REMATCH-01. 390px 결과 화면에서 고정 내비가
  // 마지막 CTA를 덮었으므로 내비 자체가 기기 하단 안전 영역을 포함해야 한다.
  it('DESIGN 높이 토큰과 기기 safe-area를 함께 예약한다', () => {
    render(<StudentBottomNavigation />);

    expect(screen.getByTestId('student-bottom-navigation')).toHaveClass(
      'min-h-control-xl',
      'pb-[env(safe-area-inset-bottom)]'
    );
  });
});
