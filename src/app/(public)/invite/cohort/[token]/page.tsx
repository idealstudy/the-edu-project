import { PublicCohortInvite } from '@/features/cohort-invite/components/public-cohort-invite';

export const metadata = {
  title: '반 초대',
  description: '선생님이 보낸 반 초대를 확인해요.',
};

type CohortInvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function CohortInvitePage({
  params,
}: CohortInvitePageProps) {
  const { token } = await params;

  return (
    <main className="flex min-h-[calc(100vh-var(--spacing-header-height))] w-full items-center justify-center bg-[#F9F9F9] px-4 py-10">
      <PublicCohortInvite token={token} />
    </main>
  );
}
