import { notFound } from 'next/navigation';

import { WrongAnswerReview } from '@/features/dashboard/components/student/wrong-answer-review';

export default async function WrongAnswerReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ question?: string }>;
}) {
  const { id } = await params;
  const { question } = await searchParams;
  const wrongAnswerId = Number(id);

  if (!Number.isSafeInteger(wrongAnswerId) || wrongAnswerId <= 0) {
    notFound();
  }

  return (
    <WrongAnswerReview
      wrongAnswerId={wrongAnswerId}
      startWithQuestion={question === '1'}
    />
  );
}
