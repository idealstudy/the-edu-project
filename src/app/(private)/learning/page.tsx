import { LearningClient } from '@/features/learning';
import { PageLayout } from '@/layout';

export const metadata = {
  title: '내 학습',
  description: '포인트·약점 트리·내 문제를 한곳에서 보는 학습 허브.',
};

export default function LearningPage() {
  return (
    <div className="bg-system-background min-h-screen w-full">
      <PageLayout>
        <PageLayout.Header className="flex-col items-start gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            내 학습
          </h1>
          <p className="font-body2-normal text-text-sub1">
            포인트와 약점 트리, 풀던 문제까지 한곳에서 이어가요.
          </p>
        </PageLayout.Header>
        <LearningClient />
      </PageLayout>
    </div>
  );
}
