import { ChallengeInviteLanding } from '@/features/social';

export const metadata = {
  title: '도전장',
  description: '친구가 보낸 도전장을 확인하고 같은 문제에 도전해요.',
};

type ChallengeInvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function ChallengeInvitePage({
  params,
}: ChallengeInvitePageProps) {
  const { token } = await params;

  return (
    <main className="flex min-h-[calc(100vh-var(--spacing-header-height))] w-full items-center justify-center bg-[#F9F9F9] px-4 py-10">
      <ChallengeInviteLanding token={token} />
    </main>
  );
}
