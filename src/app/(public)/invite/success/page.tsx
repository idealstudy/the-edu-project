import { InviteSuccessContent } from '@/features/invite/components/invite-success-content';

export default function SuccessPage() {
  return (
    <main className="bg-gray-white tablet:pt-58 desktop:pt-30 mx-auto flex h-[calc(100vh-var(--spacing-header-height))] w-full justify-center pt-35">
      <InviteSuccessContent studyRoomId={0} />
    </main>
  );
}
