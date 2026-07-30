import { notFound } from 'next/navigation';

import { WrongAnswerReview } from '@/features/dashboard/components/student/wrong-answer-review';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

export default async function WrongAnswerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertDashboardRole('ROLE_STUDENT');
  const { id } = await params;
  const wrongAnswerId = Number(id);

  if (!Number.isSafeInteger(wrongAnswerId) || wrongAnswerId <= 0) {
    notFound();
  }

  return <WrongAnswerReview wrongAnswerId={wrongAnswerId} />;
}
