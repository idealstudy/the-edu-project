import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalRoleNavigationShell } from './global-role-navigation-shell';
import {
  ParentBottomNavigation,
  TeacherBottomNavigationView,
} from './role-bottom-navigation';

const navigationMocks = vi.hoisted(() => ({
  pathname: '/',
  role: 'ROLE_STUDENT',
  studentRooms: [{ id: 31, name: '프로그램 수학' }],
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMocks.pathname,
}));

vi.mock('@/providers/session/session-context', () => ({
  useSession: () => ({
    status: 'authenticated',
    member: { role: navigationMocks.role },
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardStudyRoomListQuery: () => ({
    data: navigationMocks.studentRooms,
    isSuccess: true,
  }),
}));

vi.mock('@/features/dashboard/hooks/use-teacher-dashboard-query', () => ({
  useTeacherDashboardStudyRoomListQuery: () => ({ data: [] }),
}));

describe('역할별 모바일 하단 내비게이션', () => {
  beforeEach(() => {
    navigationMocks.pathname = '/';
    navigationMocks.role = 'ROLE_STUDENT';
    navigationMocks.studentRooms = [{ id: 31, name: '프로그램 수학' }];
  });

  it('MOB-NAV-04 공개 레이아웃에서도 학생 하단 탭과 본문 안전 여백을 렌더한다', () => {
    render(
      <GlobalRoleNavigationShell>
        <main>공개 홈</main>
      </GlobalRoleNavigationShell>
    );

    expect(screen.getByText('공개 홈').parentElement).toHaveClass(
      'pb-[calc(var(--spacing-control-xl)+var(--spacing-section-gap-mobile)+env(safe-area-inset-bottom))]',
      'shell:pb-0'
    );
    expect(screen.getByTestId('student-bottom-navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  it('MOB-NAV-05 선생님은 첫 스터디룸이 있으면 내 수업·스터디룸·마이페이지를 노출한다', () => {
    navigationMocks.pathname = '/study-rooms/88/note';
    render(
      <TeacherBottomNavigationView
        pathname={navigationMocks.pathname}
        primaryRoomId={88}
      />
    );

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'))
    ).toEqual(['내 수업', '스터디룸', '마이페이지']);
    expect(screen.getByRole('link', { name: '스터디룸' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByTestId('teacher-bottom-navigation')).toHaveClass(
      'tablet:hidden',
      'pb-[env(safe-area-inset-bottom)]'
    );
  });

  it('MOB-NAV-06 학부모 옆 메뉴 6항목을 같은 순서와 실제 라우트로 투영한다', () => {
    navigationMocks.pathname = '/dashboard/parent';
    render(<ParentBottomNavigation />);

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'))
    ).toEqual([
      '홈',
      '학습 소식',
      '스터디룸 기록일지',
      '스터디룸 둘러보기',
      '상담 내역',
      '마이페이지',
    ]);
    expect(screen.getByTestId('parent-bottom-navigation')).toHaveClass(
      'grid-cols-6',
      'tablet:hidden'
    );
    screen
      .getAllByRole('link')
      .forEach((link) => expect(link).toHaveClass('min-h-control-xl'));
  });
});
