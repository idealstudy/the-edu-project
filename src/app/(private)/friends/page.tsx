import { FriendsClient, MyChallengeInvites } from '@/features/social';

export const metadata = {
  title: '친구',
  description: '친구를 추가하고 도전장을 주고받아요.',
};

export default function FriendsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            친구
          </h1>
          <p className="font-body2-normal text-text-sub1">
            친구를 추가하고, 같은 문제로 도전장을 주고받아요.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <FriendsClient />
          <MyChallengeInvites />
        </div>
      </div>
    </div>
  );
}
