import { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import { SessionGuard } from '@/providers';
import { fetchMemberRole } from '@/shared/lib/server';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await fetchMemberRole();

  if (session.status === 'stale') redirect('/api/v1/auth/clear-session');
  if (session.status === 'guest') redirect('/login');
  if (session.role === 'ROLE_MEMBER') redirect('/select-role');

  return (
    <SessionGuard>
      <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        <DashboardSidebar />
        <div className="w-full">{children}</div>
      </main>
    </SessionGuard>
  );
}
