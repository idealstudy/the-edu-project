'use client';

import { useSearchParams } from 'next/navigation';

import { usePublicTeachersQuery } from '@/features/list/api/teacher.public.query';
import { TeacherCard } from '@/features/list/components/teacher-card';
import { MiniSpinner } from '@/shared/components/loading';

type SortOption = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';
type SortSubjectOption = 'ALL' | 'KOREAN' | 'ENGLISH' | 'MATH' | 'OTHER';

export default function TeachersListPage() {
  const searchParams = useSearchParams();

  const sort = (searchParams.get('sort') ?? 'LATEST') as SortOption;
  const subject = (searchParams.get('subject') ?? 'ALL') as SortSubjectOption;

  const { data, isLoading } = usePublicTeachersQuery({
    page: 0,
    size: 20,
    sort: sort,
    subject: subject,
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <MiniSpinner />
      </div>
    );
  }

  if (!data?.content || data.content.length === 0) {
    return (
      <div className="font-body2-normal text-text-sub2 py-12 text-center">
        공개된 선생님 프로필이 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.content.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
        />
      ))}
    </div>
  );
}
