import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { LessonViewClient } from '@/features/course';
import { BackButton } from '@/shared/components/ui';

export const metadata = {
  title: '코스 학습',
  description: '차시를 따라가며 학습하고 진도를 기록해요.',
};

type LessonViewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonViewPage({ params }: LessonViewPageProps) {
  const { id } = await params;
  const courseId = Number(id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-shell px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <div className="mb-6">
          <BackButton />
        </div>
        <Suspense fallback={null}>
          <LessonViewClient courseId={courseId} />
        </Suspense>
      </div>
    </div>
  );
}
