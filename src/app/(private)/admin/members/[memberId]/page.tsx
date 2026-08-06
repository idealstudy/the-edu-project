import { notFound } from 'next/navigation';

import { AdminMemberDetail } from '@/features/admin-member/components/admin-member-detail';

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const id = Number(memberId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <AdminMemberDetail memberId={id} />;
}
