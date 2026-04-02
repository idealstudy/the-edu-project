import { notFound } from 'next/navigation';

import InquiryWriteArea from '@/features/inquiry/components/inquiry-write-area';

type PageProps = {
  searchParams: Promise<{ teacherId?: string; studyRoomId?: string }>;
};

export default async function InquiryNewPage({ searchParams }: PageProps) {
  const { teacherId, studyRoomId } = await searchParams;

  if (!teacherId) notFound();

  return (
    <InquiryWriteArea
      teacherId={Number(teacherId)}
      studyRoomId={studyRoomId ? Number(studyRoomId) : undefined}
    />
  );
}
