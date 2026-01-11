import BackLink from '@/features/dashboard/studynote/components/back-link';
import HomeworkDetailRoleSwitch from '@/features/homework/components/detail/homework-detail-role-switch';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string; homeworkId: string }>;
};

export default async function HomeworkDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);
  const homeworkId = Number(resolvedParams.homeworkId);
  return (
    <div className="flex-col">
      <div className="mb-6">
        <BackLink />
      </div>
      <ColumnLayout className="items-start gap-6 p-6">
        <HomeworkDetailRoleSwitch
          studyRoomId={studyRoomId}
          homeworkId={homeworkId}
        />
      </ColumnLayout>
    </div>
  );
}
