import { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { AdminShell } from '@/features/admin-operations/components/admin-shell';
import { fetchMemberRole } from '@/shared/lib/server';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await fetchMemberRole();
  if (session.status !== 'authenticated' || session.role !== 'ROLE_ADMIN') {
    redirect('/403');
  }
  return <AdminShell>{children}</AdminShell>;
}
