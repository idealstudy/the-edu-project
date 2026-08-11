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
        <LearningClient />
      </PageLayout>
    </div>
  );
}
