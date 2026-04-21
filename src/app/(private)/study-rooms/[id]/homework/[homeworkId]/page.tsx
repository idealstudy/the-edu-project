import HomeworkDetailRoleSwitch from '@/features/homework/components/detail/homework-detail-role-switch';

type Props = {
  params: Promise<{ id: string; homeworkId: string }>;
  searchParams: Promise<{ studentId?: string }>;
};

export default async function HomeworkDetailPage({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const studyRoomId = Number(resolvedParams.id);
  const homeworkId = Number(resolvedParams.homeworkId);
  const studentId = resolvedSearchParams.studentId
    ? Number(resolvedSearchParams.studentId)
    : 0;

  return (
    <HomeworkDetailRoleSwitch
      studyRoomId={studyRoomId}
      homeworkId={homeworkId}
      studentId={studentId}
    />
  );
}
