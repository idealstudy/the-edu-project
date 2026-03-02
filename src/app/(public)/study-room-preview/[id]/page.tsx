import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StudyRoomDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const studyRoomId = Number(id);
  if (!Number.isInteger(studyRoomId) || studyRoomId <= 0) notFound();

  const teacherIdParam = sp.teacherId;
  const teacherId = Number(
    Array.isArray(teacherIdParam) ? teacherIdParam[0] : teacherIdParam
  );
  if (!Number.isInteger(teacherId) || teacherId <= 0) notFound();

  redirect(`/study-room-preview/${studyRoomId}/${teacherId}`);
}
