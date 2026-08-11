import { LearningClient } from '@/features/learning';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '내 학습',
  description: '포인트·약점 트리·내 문제를 한곳에서 보는 학습 허브.',
};

export default function LearningPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      {/* 화면 제목(h1)은 전역 앱 헤더가 그린다. 여기서 또 그리면 "내 학습"이 두 번 보인다.
          2026-08-11 dev 화면을 눈으로 보고 잡은 결함이다. friends·points·tree 는 같은 이유로
          이미 페이지 제목을 걷어냈는데 이 화면만 빠뜨렸다. */}
      <PageLayout>
        <LearningClient />
      </PageLayout>
    </div>
  );
}
