import { TeacherMyPage } from '@/features/dashboard/components/teacher/teacher-my-page';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function TeacherMyRoute() {
  const { initialMemberName } = await assertDashboardRole('ROLE_TEACHER');
  return <TeacherMyPage memberName={initialMemberName} />;
}
