import { ReactNode, Suspense } from 'react';

import { cookies } from 'next/headers';

import { DashboardPrivateShell } from '@/features/dashboard/components/dashboard-private-shell';
import { fetchMemberRole } from '@/shared/lib/server';

import { RoleRedirect } from './components/role-redirect';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await fetchMemberRole();
  const cookieJar = await cookies();
  const impersonatingCookie = cookieJar.get('admin-impersonating');
  const impersonationExpiresAt = Number(impersonatingCookie?.value ?? 0);
  const isImpersonating = impersonationExpiresAt > Date.now();

  const isSessionRoleMember =
    session.status === 'authenticated' && session.role === 'ROLE_MEMBER';

  if (isSessionRoleMember)
    return (
      <Suspense>
        <RoleRedirect />
      </Suspense>
    );

  return (
    <DashboardPrivateShell
      initialRole={
        session.status === 'authenticated' ? session.role : undefined
      }
      initialMemberName={
        session.status === 'authenticated' ? session.name : undefined
      }
      impersonation={{
        active: isImpersonating,
        expiresAt: impersonationExpiresAt,
      }}
    >
      {children}
    </DashboardPrivateShell>
  );
}
