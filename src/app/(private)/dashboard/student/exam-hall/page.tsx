import { ExamHall } from '@/features/exam/components/exam-hall';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentExamHallPage() {
  await assertDashboardRole('ROLE_STUDENT');
  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 md:px-10">
      <ExamHall />
    </main>
  );
}
