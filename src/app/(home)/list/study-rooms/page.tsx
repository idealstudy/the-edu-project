'use client';

import { useSearchParams } from 'next/navigation';

import { usePublicStudyRoomsQuery } from '@/features/list/api/teacher.public.query';
import { StudyRoomCard } from '@/features/list/components/study-room-card';
import { MiniSpinner } from '@/shared/components/loading';

type SortOption = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';
type SortSubjectOption = 'ALL' | 'KOREAN' | 'ENGLISH' | 'MATH' | 'OTHER';

export default function StudyRoomListPage() {
  const searchParams = useSearchParams();

  const sort = (searchParams.get('sort') ?? 'LATEST') as SortOption;
  const subject = (searchParams.get('subject') ?? 'ALL') as SortSubjectOption;

  const { data, isLoading } = usePublicStudyRoomsQuery({
    page: 0,
    size: 20,
    sort: sort,
    subject: subject,
  });

  if (isLoading)
    return (
      <div className="py-12 text-center">
        <MiniSpinner />
      </div>
    );

  if (!data?.content || data.content.length === 0) {
    return (
      <div className="font-body2-normal text-text-sub2 py-12 text-center">
        공개된 스터디룸이 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.content.map((room) => (
        <StudyRoomCard
          key={room.id}
          studyRoom={room}
        />
      ))}
    </div>
  );
}
