import { WeaknessTreeClient } from '@/features/weakness-tree/components/weakness-tree-client';

export const metadata = {
  title: '약점 트리',
  description: '제대로 풀수록 오렌지로 채워지는 내 학습 지도.',
};

export default function TreePage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            약점 트리
          </h1>
          <p className="font-body2-normal text-text-sub1">
            제대로 풀수록 단원이 오렌지로 채워져요. 더 풀어볼 단원을 눌러보세요.
          </p>
        </header>

        <WeaknessTreeClient />
      </div>
    </div>
  );
}
