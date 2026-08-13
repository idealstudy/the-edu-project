import { PointWalletClient } from '@/features/point/components/point-wallet-client';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '포인트',
  description: '자력으로 풀어 모으고, 필요할 때 쓰는 내 포인트 지갑.',
};

export default function PointsPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      <PageLayout width="content">
        <PageLayout.Header>
          <div>
            <h2 className="text-gray-12 font-headline1-heading">포인트</h2>
            <p className="text-gray-9 font-caption-normal mt-inline-gap-xs">
              공부한 노력으로 모으고 필요한 학습 행동에 사용해요.
            </p>
          </div>
        </PageLayout.Header>
        <PointWalletClient />
      </PageLayout>
    </div>
  );
}
