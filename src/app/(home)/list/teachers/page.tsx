'use client';

import { useSearchParams } from 'next/navigation';

import { usePublicTeachersQuery } from '@/features/list/api/teacher.public.query';
import { TeacherCard } from '@/features/list/components/teacher-card';
import { MiniSpinner } from '@/shared/components/loading';

type SortOption = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';

export default function TeachersListPage() {
  const searchParams = useSearchParams();
  const sortBy = (searchParams.get('sort') ?? 'LATEST') as SortOption;

  const { data, isLoading } = usePublicTeachersQuery({
    page: 0,
    size: 20,
    sort: sortBy,
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <MiniSpinner />
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
