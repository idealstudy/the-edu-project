import {
  FriendsClient,
  FriendsTutorial,
  MyChallengeInvites,
} from '@/features/social';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '친구',
  description: '친구를 추가하고 도전장을 주고받아요.',
};

export default function FriendsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      <PageLayout width="content">
        <PageLayout.Header className="items-end justify-between">
          <div>
            <h2 className="text-gray-12 font-headline1-heading">친구</h2>
            <p className="text-gray-9 font-caption-normal mt-inline-gap-xs">
              순위보다 함께 푼 기록과 지금 내 차례에 집중해요.
            </p>
          </div>
          <FriendsTutorial />
        </PageLayout.Header>

        <div className="gap-section-gap desktop:grid-cols-2 grid grid-cols-1 items-start">
          <FriendsClient />
          <MyChallengeInvites />
        </div>
      </PageLayout>
    </div>
  );
}
