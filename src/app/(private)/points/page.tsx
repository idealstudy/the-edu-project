import { PointWalletClient } from '@/features/point/components/point-wallet-client';

export const metadata = {
  title: '포인트',
  description: '자력으로 풀어 모으고, 필요할 때 쓰는 내 포인트 지갑.',
};

export default function PointsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            포인트
          </h1>
          <p className="font-body2-normal text-text-sub1">
            제대로 풀어 모으고, 필요할 때 쓰는 소모 화폐예요.
          </p>
        </header>

        <PointWalletClient />
      </div>
    </div>
  );
}
