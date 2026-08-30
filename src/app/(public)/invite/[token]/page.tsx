import { PublicTeacherInvite } from '@/features/teacher-invite/components/public-teacher-invite';

export default async function TeacherInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicTeacherInvite token={token} />;
}
