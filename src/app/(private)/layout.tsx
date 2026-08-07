import { ReactNode, Suspense } from 'react';

import { cookies } from 'next/headers';

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
        className="flex flex-col bg-[#fcfbfa] md:pl-[186px]"
        data-private-app-shell
      >
        <DashboardSidebar />
        <ImpersonationBanner
          active={isImpersonating}
          memberName={
            session.status === 'authenticated' ? session.name : '대상 회원'
          }
        />
        <div className="w-full">{children}</div>
      </main>
    </SessionGuard>
  );
}
