import { FriendsClient, FriendsTutorial } from '@/features/social';

export const metadata = {
  title: '친구',
  description: '친구를 추가하고 도전장을 주고받아요.',
};

export default function FriendsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      <div className="mx-auto w-full max-w-shell px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <div className="mb-6">
          <FriendsTutorial />
        </div>

        <FriendsClient />
      </div>
    </div>
  );
}
