import { StudentTeacherInviteCard } from '@/features/teacher-invite/components/student-teacher-invite-card';
import { PageLayout } from '@/layout';

export default function ConnectionListPage() {
  return (
    <PageLayout width="fluid">
      <StudentTeacherInviteCard />
    </PageLayout>
  );
}
