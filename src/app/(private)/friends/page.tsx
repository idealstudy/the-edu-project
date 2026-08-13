import { FriendsClient, FriendsTutorial } from '@/features/social';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '친구',
  description: '친구를 추가하고 도전장을 주고받아요.',
};

export default function FriendsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      <PageLayout width="content">
        <FriendsClient footer={<FriendsTutorial />} />
      </PageLayout>
    </div>
  );
}
