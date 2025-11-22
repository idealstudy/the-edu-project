import { QuestionDetail } from '@/features/qna/components/detail/qna-detail';

type Props = {
  params: Promise<{ id: string; contextId: string }>;
};

export default async function QuestionDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);
  const contextId = Number(resolvedParams.contextId);

  // layout.tsx에서 이미 ColumnLayout을 제공하므로 여기서는 children만 렌더링
  return (
    <QuestionDetail
      studyRoomId={studyRoomId}
      contextId={contextId}
    />
  );
}
