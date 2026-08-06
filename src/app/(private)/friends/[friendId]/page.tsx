import { FriendDetailClient } from '@/features/social';

type FriendDetailPageProps = {
  params: Promise<{ friendId: string }>;
};

export default async function FriendDetailPage({
  params,
}: FriendDetailPageProps) {
  const { friendId } = await params;
  return <FriendDetailClient friendId={Number(friendId)} />;
}
