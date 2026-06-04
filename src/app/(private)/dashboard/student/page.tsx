import { DashboardStudentContainer } from '@/features/dashboard/components/dashboard-student-container';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentDashboardPage() {
  const { initialMemberName } = await assertDashboardRole('ROLE_STUDENT');

  return <DashboardStudentContainer initialMemberName={initialMemberName} />;
}
