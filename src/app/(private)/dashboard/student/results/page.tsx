import { StudentResultsPage } from '@/features/dashboard/components/student/student-results-page';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function StudentResultsRoute() {
  await assertDashboardRole('ROLE_STUDENT');
  return <StudentResultsPage />;
}
