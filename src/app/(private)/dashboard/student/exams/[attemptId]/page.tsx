import { ExamAttemptClient } from '@/features/exam/components/exam-attempt-client';
import StudentDashboardHeader from '@/features/dashboard/components/header/student-header';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { initialMemberName } = await assertDashboardRole('ROLE_STUDENT');
  const { attemptId } = await params;
  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <StudentDashboardHeader
        initialMemberName={initialMemberName}
        title="시험 응시"
      />
      <main className="p-4">
        <ExamAttemptClient attemptId={Number(attemptId)} />
      </main>
    </div>
  );
}
