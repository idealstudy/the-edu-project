import { WeaknessTreeClient } from '@/features/weakness-tree/components/weakness-tree-client';

export const metadata = {
  title: '약점 트리',
  description: '제대로 풀수록 오렌지로 채워지는 내 학습 지도.',
};

export default function TreePage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-shell px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <WeaknessTreeClient />
      </div>
    </div>
  );
}
