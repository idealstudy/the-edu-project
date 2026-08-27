import { PointWalletClient } from '@/features/point/components/point-wallet-client';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '포인트',
  description: '자력으로 풀어 모으고, 필요할 때 쓰는 내 포인트 지갑.',
};

export default function PointsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      {/* DESIGN.md §4.2: 포인트 = 표준 셸(max-w-shell, 1200px). content(1100px)는 오적용이었다. */}
      <div className="mx-auto w-full max-w-shell">
        <PageLayout width="fluid">
          {/* design.md §14.8-2: 앱바가 이미 "포인트" 제목을 표시하므로 본문 H1은
              중복이다. 안내 문구만 첫 섹션 보조 설명으로 남긴다. */}
          <PageLayout.Header>
            <p className="text-gray-9 font-caption-normal">
              공부한 노력으로 모으고 필요한 학습 행동에 사용해요.
            </p>
          </PageLayout.Header>
          <PointWalletClient />
        </PageLayout>
      </div>
    </div>
  );
}
