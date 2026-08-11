import { PointWalletClient } from '@/features/point/components/point-wallet-client';

export const metadata = {
  title: '포인트',
  description: '자력으로 풀어 모으고, 필요할 때 쓰는 내 포인트 지갑.',
};

export default function PointsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <PointWalletClient />
      </div>
    </div>
  );
}
