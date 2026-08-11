import { ParentDashboardClient } from '@/features/parent';

export const metadata = {
  title: '자녀 학습',
  description: '연결된 자녀의 학습 흐름을 회고하는 학부모 대시보드.',
};

export default function ParentDashboardPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-shell px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            자녀 학습
          </h1>
          <p className="font-body2-normal text-text-sub1">
            자녀가 어떻게 공부하고 있는지 회고하고 응원하는 공간이에요.
          </p>
        </header>

        <ParentDashboardClient />
      </div>
    </div>
  );
}
