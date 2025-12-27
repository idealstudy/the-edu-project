import { ColumnLayout } from '@/layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ProfileLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F9F9F9]">
      <ColumnLayout>{children}</ColumnLayout>
    </main>
  );
}
