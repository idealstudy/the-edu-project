import { DashboardParentContainer } from '@/features/dashboard/components/dashboard-parent-container';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function ParentDashboardPage() {
  await assertDashboardRole('ROLE_PARENT');

  return <DashboardParentContainer />;
}
