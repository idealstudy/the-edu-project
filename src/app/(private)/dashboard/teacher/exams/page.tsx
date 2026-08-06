import { ExamCreate } from '@/features/exam/components/exam-create';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function TeacherExamCreatePage() {
  await assertDashboardRole('ROLE_TEACHER');
  return (
    <main className="min-h-screen bg-[#f6f7f9] p-6">
      <div className="mx-auto max-w-[1120px]">
        <ExamCreate />
      </div>
    </main>
  );
}
