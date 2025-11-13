import { ReactNode } from 'react';

// import { SessionGuard } from '@/providers';
import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    /*<SessionGuard>
      <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        {/!*<Sidebar />*!/}
        <div className="px-grid-margin w-full">{children}</div>
      </main>
    </SessionGuard>*/
    <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
      <DashboardSidebar />
      <div className="px-grid-margin w-full">{children}</div>
    </main>
  );
}
