import { getPublicStudyRooms } from '@/features/list';
import { StudyRoomCard } from '@/features/list/components/study-room-card';

type SortOption = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';
/* TODO : 추후 업데이트 이후 적용 예정 */
// type SortSubjectOption = 'ALL' | 'KOREAN' | 'ENGLISH' | 'MATH' | 'OTHER';

const parseSort = (value?: string): SortOption => {
  if (value === 'OLDEST' || value === 'ALPHABETICAL') return value;
  return 'LATEST';
};

export default async function StudyRoomListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sort = parseSort(typeof sp.sort === 'string' ? sp.sort : undefined);

  const data = await getPublicStudyRooms({
    page: 0,
    size: 20,
    sort: sort,
  });

  if (!data?.content || data.content.length === 0) {
    return (
      <div className="font-body2-normal text-text-sub2 py-12 text-center">
        공개된 스터디룸이 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data?.content.map((room) => (
        <StudyRoomCard
          key={room.id}
          studyRoom={room}
        />
      ))}
    </div>
  );
}
