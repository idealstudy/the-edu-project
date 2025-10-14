import { ColumnLayout } from '@/components/layout/column-layout';
import { ClientStudyRoomDetail } from '@/features/studyrooms/components/detail/client-study-room-detail';

export default async function StudyRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <main>
      <ColumnLayout>
        <ClientStudyRoomDetail roomId={Number(resolvedParams.id)} />
      </ColumnLayout>
    </main>
  );
}
