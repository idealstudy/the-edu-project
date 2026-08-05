import { ReactNode, Suspense } from 'react';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
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
      <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        <DashboardSidebar />
        <ImpersonationBanner />
        <div className="w-full">{children}</div>
      </main>
    </SessionGuard>
  );
}
