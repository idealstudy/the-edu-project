import BackLink from '@/features/dashboard/studynote/components/back-link';
import QnAWriteDetail from '@/features/qna/components/write/qna-write-detail';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QnAWritePage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <main>
      <div className="mb-6">
        <BackLink />
      </div>
      <ColumnLayout>
        <QnAWriteDetail studyRoomId={Number(resolvedParams.id)} />
      </ColumnLayout>
    </main>
  );
}
