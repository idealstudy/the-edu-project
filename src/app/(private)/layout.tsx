import { ReactNode } from 'react';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';
import { SessionGuard } from '@/providers';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SessionGuard>
      <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        <DashboardSidebar />
        <div className="px-grid-margin w-full">{children}</div>
      </main>
    </SessionGuard>
  );
}
