import { ReactNode, Suspense } from 'react';

import { cookies } from 'next/headers';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import { DashboardAppHeader } from '@/features/dashboard/components/header/dashboard-app-header';
import { StudentBottomNavigation } from '@/features/dashboard/components/student/student-bottom-navigation';
import { ImpersonationBanner } from '@/features/impersonation/components/impersonation-banner';
import { SessionGuard } from '@/providers/session/session-guard';
import { fetchMemberRole } from '@/shared/lib/server';

import { RoleRedirect } from './components/role-redirect';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await fetchMemberRole();
  const cookieJar = await cookies();
  const isImpersonating = cookieJar.has('admin-impersonating');

  const isSessionRoleMember =
    session.status === 'authenticated' && session.role === 'ROLE_MEMBER';

  if (isSessionRoleMember)
    return (
      <Suspense>
        <RoleRedirect />
      </Suspense>
    );

  return (
    <SessionGuard>
      <main
        className={`bg-system-background tablet:pl-sidebar-rail-width desktop:pl-sidebar-width flex min-h-screen flex-col ${session.status === 'authenticated' && session.role === 'ROLE_STUDENT' ? 'pb-[calc(var(--spacing-control-xl)+var(--spacing-section-gap-mobile)+env(safe-area-inset-bottom))] md:pb-0' : ''}`}
        data-private-app-shell
      >
        <DashboardSidebar />
        <ImpersonationBanner
          active={isImpersonating}
          memberName={
            session.status === 'authenticated' ? session.name : '대상 회원'
          }
        />
        {session.status === 'authenticated' && (
          <DashboardAppHeader
            role={session.role}
            initialMemberName={session.name}
          />
        )}
        <div className="w-full">{children}</div>
        {session.status === 'authenticated' &&
          session.role === 'ROLE_STUDENT' && <StudentBottomNavigation />}
      </main>
    </SessionGuard>
  );
}
