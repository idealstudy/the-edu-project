import { notFound } from 'next/navigation';

import StudyRoomFlow from '@/features/study-rooms/components/create/study-room-flow';
import { ColumnLayout } from '@/layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditStudyRoomPage({ params }: Props) {
  const { id } = await params;
  const studyRoomId = Number(id);

  if (!Number.isInteger(studyRoomId) || studyRoomId <= 0) {
    notFound();
  }
  return (
    <div className="w-full flex-col">
      <ColumnLayout className="desktop:flex-col justify-center gap-0">
        <div className="tablet:p-8 rounded-md bg-white p-4">
          <StudyRoomFlow
            mode="edit"
            studyRoomId={studyRoomId}
          />
        </div>
      </ColumnLayout>
    </div>
  );
}
