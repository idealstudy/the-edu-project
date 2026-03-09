import { redirect } from 'next/navigation';

import ProfileMain from '@/features/profile/components/profile-main';

type PageProps = {
  params: Promise<{ teacherId: string }>;
};

export default async function TeacherProfilePage({ params }: PageProps) {
  const { teacherId } = await params;

  if (!teacherId) redirect('/');

  return (
    <ProfileMain
      memberId={Number(teacherId)}
      role="ROLE_TEACHER"
    />
  );
}
