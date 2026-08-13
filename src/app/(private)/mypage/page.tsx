import MyColumnList from '@/features/mypage/column/components/my-column-list';
import {
  MypageDefaultView,
  MypageProfileView,
} from '@/features/mypage/components/mypage-role-view';
import MyInquiryList from '@/features/mypage/inquiry/components/my-inquiry-list';
import ReceivedInquiryList from '@/features/mypage/inquiry/components/received-inquiry-list';
import { MyOpenChallengeList } from '@/features/mypage/open-challenge/components/my-open-challenge-list';
import { PageLayout } from '@/layout';

export default async function MypagePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  // TEACHER, STUDENT, PARENT
  if (tab === 'profile') return <MypageProfileView />;

  // TEACHER, STUDENT, PARENT
  if (tab === 'open-challenges')
    return (
      <PageLayout>
        <MyOpenChallengeList />
      </PageLayout>
    );

  // STUDENT, PARENT
  if (tab === 'inquiries')
    return (
      <PageLayout>
        <MyInquiryList />
      </PageLayout>
    );

  // TEACHER_ONLY
  if (tab === 'columns')
    return (
      <PageLayout>
        <MyColumnList />
      </PageLayout>
    );
  if (tab === 'received-inquiries')
    return (
      <PageLayout>
        <ReceivedInquiryList />
      </PageLayout>
    );

  return <MypageDefaultView />;
}
