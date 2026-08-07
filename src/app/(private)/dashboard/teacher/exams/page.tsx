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
    <main className="min-h-screen bg-[#f6f7f9] p-6">
      <div className="mx-auto max-w-[1120px]">
        <ExamCreate initialStudyRoomId={initialStudyRoomId} />
      </div>
    </main>
  );
}
