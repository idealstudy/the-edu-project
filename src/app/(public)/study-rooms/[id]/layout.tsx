import { ColumnLayout } from '@/layout/column-layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default function StudyRoomsLayout({ children }: LayoutProps) {
  return (
    <main>
      <ColumnLayout>{children} </ColumnLayout>
    </main>
  );
}
