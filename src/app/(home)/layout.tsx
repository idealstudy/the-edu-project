import { AppShell } from '@/shared/components/app-shell';

export default function HomeGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
