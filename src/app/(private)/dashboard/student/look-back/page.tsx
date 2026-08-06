import { LookBackPage } from '@/features/dashboard/components/student/look-back-page';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function LookBackRoute() {
  await assertDashboardRole('ROLE_STUDENT');
  return <LookBackPage />;
}
