import { getPublicTeachers } from '@/features/list';
import { TeacherCard } from '@/features/list/components/teacher-card';

type SortOption = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';

const parseSort = (value?: string): SortOption => {
  if (value === 'OLDEST' || value === 'ALPHABETICAL') return value;
  return 'LATEST';
};

export default async function TeachersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sort = parseSort(typeof sp.sort === 'string' ? sp.sort : undefined);
  /* TODO : 추후 업데이트 이후 적용 예정 */

  // const subject = typeof sp.subject === 'string' ? sp.subject : 'ALL';

  const data = await getPublicTeachers({
    page: 0,
    size: 20,
    sort: sort,
    // subject: subject as 'ALL' | 'KOREAN' | 'ENGLISH' | 'MATH' | 'OTHER',
  });

  if (!data?.content || data.content.length === 0) {
    return (
      <div className="font-body2-normal text-text-sub2 py-12 text-center">
        공개된 선생님 프로필이 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {data?.content.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
        />
      ))}
    </div>
  );
}
