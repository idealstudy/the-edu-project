import { notFound } from 'next/navigation';

import { CourseDetailClient } from '@/features/course';

export const metadata = {
  title: '코스 상세',
  description: '코스 차시와 수강 정보를 확인해요.',
};

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;
  const courseId = Number(id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-shell px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <CourseDetailClient courseId={courseId} />
      </div>
    </div>
  );
}
