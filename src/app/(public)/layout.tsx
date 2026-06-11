import { AppShell } from '@/shared/components/app-shell';

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
