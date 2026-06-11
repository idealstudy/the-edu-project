import { ChildReportClient } from '@/features/parent';

export const metadata = {
  title: '자녀 학습 리포트',
  description: '고민시간·조교활용도·해설의존도와 예상 등급 범위로 보는 학습 회고.',
};

export default async function ChildReportPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <ChildReportClient childId={Number(childId)} />
      </div>
    </div>
  );
}
