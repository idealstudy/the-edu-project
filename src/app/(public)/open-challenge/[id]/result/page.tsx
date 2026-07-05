import { ChallengeResult } from '@/features/open-challenge/components/result/challenge-result';
import { fetchMemberRole } from '@/shared/lib/server';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeResultPage({ params }: PageProps) {
  const { id } = await params;
  const session = await fetchMemberRole();

  return (
    <ChallengeResult
      challengeId={id}
      isGuest={session.status !== 'authenticated'}
    />
  );
}
