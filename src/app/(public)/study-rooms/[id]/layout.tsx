import { ColumnLayout } from '@/layout/column-layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default function StudyRoomsLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F9F9F9]">
      <ColumnLayout>{children} </ColumnLayout>
    </main>
  );
}
