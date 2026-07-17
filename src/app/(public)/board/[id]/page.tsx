import { redirect } from 'next/navigation';

import { PUBLIC } from '@/shared/constants';

// /board/:id → 기존 /community/column/:id(조회수 증가·좋아요 등 이미 결선된
// 경로)로 정합 리다이렉트. ColumnCard가 이미 그 경로로 링크한다.
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BoardDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  redirect(
    Number.isFinite(numericId)
      ? PUBLIC.COMMUNITY.COLUMN.DETAIL(numericId)
      : PUBLIC.BOARD.LIST
  );
}
