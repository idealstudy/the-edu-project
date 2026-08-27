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
          {/* design.md §14.8-2: 앱바가 이미 "친구" 제목을 표시하므로 본문 H1은
              중복이다. 안내 문구만 첫 섹션 보조 설명으로 남긴다. */}
          <PageLayout.Header>
            <p className="text-gray-9 font-caption-normal">
              순위보다 함께 푼 기록과 지금 내 차례에 집중해요.
            </p>
          </PageLayout.Header>
          <FriendsClient footer={<FriendsTutorial />} />
        </PageLayout>
      </div>
    </div>
  );
}
