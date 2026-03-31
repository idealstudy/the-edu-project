import MyColumnList from '@/features/mypage/column/components/my-column-list';
import MyConsultationList from '@/features/mypage/consultation/components/my-consultation-list';
import ReceivedConsultationList from '@/features/mypage/consultation/components/received-consultation-list';
import ProfileMain from '@/features/mypage/profile/components/profile-main';

export default async function MypagePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  // TEACHER, STUDENT
  if (tab === 'profile') return <ProfileMain />;

  // STUDENT, PARENT
  if (tab === 'consultations') return <MyConsultationList />;

  // TEACHER_ONLY
  if (tab === 'columns') return <MyColumnList />;
  if (tab === 'received-consultations') return <ReceivedConsultationList />;

  return null;
}
