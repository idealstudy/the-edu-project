import { AdminOpenChallengeForm } from '@/features/open-challenge-admin/components/admin-open-challenge-form';

type Props = {
  searchParams: Promise<{ grade?: string; treeNodeId?: string }>;
};

export default async function AdminOpenChallengeNewPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const grade =
    params.grade === 'HIGH_1' || params.grade === 'HIGH_2'
      ? params.grade
      : undefined;
  const parsedTreeNodeId = Number(params.treeNodeId);
  const treeNodeId =
    Number.isInteger(parsedTreeNodeId) && parsedTreeNodeId > 0
      ? parsedTreeNodeId
      : undefined;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8 lg:px-20">
        <AdminOpenChallengeForm prefill={{ grade, treeNodeId }} />
      </div>
    </div>
  );
}
