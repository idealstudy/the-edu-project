'use client';

import type { ReactNode } from 'react';

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
  const usesTabletRail = role === 'ROLE_TEACHER' || role === 'ROLE_PARENT';

  return (
    <SessionGuard>
      <main
        className={`bg-system-background desktop:pl-sidebar-width flex min-h-screen flex-col ${isStudent ? 'shell:pl-sidebar-width' : usesTabletRail ? 'tablet:pl-sidebar-rail-width' : 'shell:pl-sidebar-rail-width'}`}
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
      </main>
    </SessionGuard>
  );
};
