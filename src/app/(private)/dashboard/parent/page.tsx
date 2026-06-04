import { DashboardParentContainer } from '@/features/dashboard/components/dashboard-parent-container';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function ParentDashboardPage() {
  const { initialMemberName } = await assertDashboardRole('ROLE_PARENT');

  return <DashboardParentContainer initialMemberName={initialMemberName} />;
}
