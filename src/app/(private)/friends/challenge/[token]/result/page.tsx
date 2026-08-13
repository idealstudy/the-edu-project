import { ChallengeResultScreen } from '@/features/social';

export const metadata = {
  title: '대결 결과',
  description: '친구와의 대결 결과를 비교해요.',
};

type ChallengeResultPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ChallengeResultPage({
  params,
}: ChallengeResultPageProps) {
  const { token } = await params;

  return <ChallengeResultScreen token={token} />;
}
