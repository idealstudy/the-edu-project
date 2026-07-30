import { WrongAnswerWarehouse } from '@/features/dashboard/components/student/wrong-answer-warehouse';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function WrongAnswersPage() {
  await assertDashboardRole('ROLE_STUDENT');

  return <WrongAnswerWarehouse />;
}
