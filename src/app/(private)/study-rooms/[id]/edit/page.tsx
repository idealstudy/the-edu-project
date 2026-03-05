import BackLink from '@/features/dashboard/studynote/components/back-link';
import StudyRoomFlow from '@/features/study-rooms/components/create/study-room-flow';
import { ColumnLayout } from '@/layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditStudyRoomPage({ params }: Props) {
  const { id } = await params;
  const studyRoomId = Number(id);
  return (
    <div className="w-full flex-col">
      <BackLink />
      <ColumnLayout className="justify-center rounded-md bg-white">
        <StudyRoomFlow
          mode="edit"
          studyRoomId={studyRoomId}
        />
      </ColumnLayout>
    </div>
  );
}
