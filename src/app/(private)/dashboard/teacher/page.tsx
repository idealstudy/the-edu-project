import { DashboardTeacherContainer } from '@/features/dashboard/components/dashboard-teacher-container';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function TeacherDashboardPage() {
  await assertDashboardRole('ROLE_TEACHER');

  return <DashboardTeacherContainer />;
}
