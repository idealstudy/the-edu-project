'use client';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import { useSession } from '@/providers';
import { cn } from '@/shared/lib';

/**
 * 공개(비회원도 접근 가능) 페이지를 위한 조건부 사이드바 셸.
 *
 * - 로그인 상태(`authenticated`)면 회원 화면처럼 `DashboardSidebar`로 감싼다.
 * - 비로그인이면 children을 그대로 렌더(기존 공개 뷰 유지).
 * - SessionGuard와 달리 강제 redirect를 하지 않는다(공개 페이지는 비로그인도 봐야 함).
 *
 * 사이드바는 `fixed` 포지션이므로, 본문은 로그인 시에만 `pl-sidebar-width`로 오프셋한다.
 * 본문 랜드마크(`<main>`)는 각 페이지가 소유하므로 셸은 `<div>`로 감싼다(중첩 main 방지).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isAuthenticated && 'desktop:pl-sidebar-width'
      )}
    >
      {isAuthenticated && <DashboardSidebar />}
      {children}
    </div>
  );
}
