'use client';

import type { ReactNode } from 'react';

import { StudentBottomNavigation } from '@/features/dashboard/components/student/student-bottom-navigation';
import { ImpersonationBanner } from '@/features/impersonation/components/impersonation-banner';
import { useSession } from '@/providers/session/session-context';
import { SessionGuard } from '@/providers/session/session-guard';

import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardAppHeader } from './header/dashboard-app-header';

type DashboardPrivateShellProps = {
  children: ReactNode;
  initialRole?: string;
  initialMemberName?: string;
  impersonation: {
    active: boolean;
    expiresAt: number;
  };
};

export const DashboardPrivateShell = ({
  children,
  initialRole,
  initialMemberName = '',
  impersonation,
}: DashboardPrivateShellProps) => {
  const session = useSession();
  const role = session.member?.role ?? initialRole;
  const memberName = session.member?.name ?? initialMemberName;
  const isStudent = role === 'ROLE_STUDENT';

  return (
    <SessionGuard>
      <main
        className={`bg-system-background desktop:pl-sidebar-width flex min-h-screen flex-col ${isStudent ? 'tablet:pl-sidebar-width pb-[calc(var(--spacing-control-xl)+var(--spacing-section-gap-mobile)+env(safe-area-inset-bottom))] md:pb-0' : 'tablet:pl-sidebar-rail-width'}`}
        data-private-app-shell
        data-private-role={role}
      >
        <DashboardSidebar />
        <ImpersonationBanner
          active={impersonation.active}
          memberName={memberName || '대상 회원'}
          expiresAt={impersonation.expiresAt}
        />
        {role && (
          <DashboardAppHeader
            role={role}
            initialMemberName={memberName}
          />
        )}
        <div className="w-full">{children}</div>
        {isStudent && <StudentBottomNavigation />}
      </main>
    </SessionGuard>
  );
};
