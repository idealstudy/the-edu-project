import { ReactNode } from 'react';

import { redirect } from 'next/navigation';

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
  return children;
}
