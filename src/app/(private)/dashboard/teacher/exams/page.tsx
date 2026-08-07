import { TeacherDashboardHeader } from '@/features/dashboard/components/header/teacher-header';
import { ExamCreate } from '@/features/exam/components/exam-create';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

type Props = {
  searchParams: Promise<{ studyRoomId?: string }>;
};

export default async function TeacherExamCreatePage({ searchParams }: Props) {
  const { initialMemberName } = await assertDashboardRole('ROLE_TEACHER');
  const { studyRoomId } = await searchParams;
  const parsedStudyRoomId = Number(studyRoomId);
  const initialStudyRoomId = Number.isInteger(parsedStudyRoomId)
    ? parsedStudyRoomId
    : undefined;

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <TeacherDashboardHeader initialMemberName={initialMemberName} />
      <main className="p-6">
        <div className="mx-auto max-w-[1120px]">
          <ExamCreate initialStudyRoomId={initialStudyRoomId} />
        </div>
      </main>
    </div>
  );
}
