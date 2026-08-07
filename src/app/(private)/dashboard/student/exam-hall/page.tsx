import { ExamHall } from '@/features/exam/components/exam-hall';
import StudentDashboardHeader from '@/features/dashboard/components/header/student-header';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentExamHallPage() {
  await assertDashboardRole('ROLE_STUDENT');
  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <StudentDashboardHeader title="응시장" />
      <main className="p-4">
        <ExamHall />
      </main>
    </div>
  );
}
