import { Sidebar } from '@/components/layout/sidebar';
import { SessionProvider } from '@/providers/session-provider';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
        <Sidebar />
        <div className="px-grid-margin w-full">{children}</div>
      </div>
    </SessionProvider>
  );
}
