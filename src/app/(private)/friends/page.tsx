import { FriendsClient, FriendsTutorial } from '@/features/social';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '친구',
  description: '친구를 추가하고 도전장을 주고받아요.',
};

export default function FriendsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      {/* DESIGN.md §4.2: 친구 = 표준 셸(max-w-shell, 1200px). content(1100px)는 오적용이었다. */}
      <div className="mx-auto w-full max-w-shell">
        <PageLayout width="fluid">
          <PageLayout.Header>
            <div>
              <h2 className="text-gray-12 font-headline1-heading">친구</h2>
              <p className="text-gray-9 font-caption-normal mt-inline-gap-xs">
                순위보다 함께 푼 기록과 지금 내 차례에 집중해요.
              </p>
            </div>
          </PageLayout.Header>
          <FriendsClient footer={<FriendsTutorial />} />
        </PageLayout>
      </div>
    </div>
  );
}
