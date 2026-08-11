import { ExamCreate } from '@/features/exam/components/exam-create';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

type Props = {
  searchParams: Promise<{ studyRoomId?: string }>;
};

export default async function TeacherExamCreatePage({ searchParams }: Props) {
  await assertDashboardRole('ROLE_TEACHER');
  const { studyRoomId } = await searchParams;
  const parsedStudyRoomId = Number(studyRoomId);
  const initialStudyRoomId = Number.isInteger(parsedStudyRoomId)
    ? parsedStudyRoomId
    : undefined;

  return (
    <div className="bg-system-background min-h-screen">
      <main className="p-6">
        <div className="mx-auto max-w-content-max">
          <ExamCreate initialStudyRoomId={initialStudyRoomId} />
        </div>
      </main>
    </div>
  );
}
