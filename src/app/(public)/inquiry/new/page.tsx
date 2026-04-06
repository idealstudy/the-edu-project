import { notFound } from 'next/navigation';

import InquiryWriteArea from '@/features/inquiry/components/inquiry-write-area';

type PageProps = {
  searchParams: Promise<{ teacherId?: string; studyRoomId?: string }>;
};

export default async function InquiryNewPage({ searchParams }: PageProps) {
  const { teacherId, studyRoomId } = await searchParams;

  const teacherIdNum = Number(teacherId);
  const studyRoomIdNum = studyRoomId ? Number(studyRoomId) : undefined;

  if (!teacherId || !Number.isInteger(teacherIdNum) || teacherIdNum <= 0)
    notFound();
  if (
    studyRoomIdNum !== undefined &&
    (!Number.isInteger(studyRoomIdNum) || studyRoomIdNum <= 0)
  )
    notFound();

  return (
    <InquiryWriteArea
      teacherId={teacherIdNum}
      studyRoomId={studyRoomId ? studyRoomIdNum : undefined}
    />
  );
}
