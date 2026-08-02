import { ExamAttemptClient } from '@/features/exam/components/exam-attempt-client';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  await assertDashboardRole('ROLE_STUDENT');
  const { attemptId } = await params;
  return (
    <main className="bg-system-background min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-4xl">
        <ExamAttemptClient attemptId={Number(attemptId)} />
      </div>
    </main>
  );
}
