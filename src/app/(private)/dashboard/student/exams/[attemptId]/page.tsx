import { ExamAttemptClient } from '@/features/exam/components/exam-attempt-client';

export default async function StudentExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return (
    <main className="p-4">
      <ExamAttemptClient attemptId={Number(attemptId)} />
    </main>
  );
}
