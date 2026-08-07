import { LearningManagementTab } from '@/features/study-notes/components/learning-management-tab';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LearningManagementPage({ params }: Props) {
  const { id } = await params;
  return <LearningManagementTab studyRoomId={Number(id)} />;
}
