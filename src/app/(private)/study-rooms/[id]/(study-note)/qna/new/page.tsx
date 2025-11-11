import QnAWriteDetail from '@/features/qna/components/write/qna-write-detail';
import { ColumnLayout } from '@/shared/components/layout/column-layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QnAWritePage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <main>
      <ColumnLayout>
        <QnAWriteDetail studyRoomId={Number(resolvedParams.id)} />
      </ColumnLayout>
    </main>
  );
}
