import { Sidebar } from '@/shared/components/layout/sidebar';
import { SessionGuard } from '@/shared/providers';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionGuard>
      <main className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        <Sidebar />
        <div className="px-grid-margin w-full">{children}</div>
      </main>
    </SessionGuard>
  );
}
