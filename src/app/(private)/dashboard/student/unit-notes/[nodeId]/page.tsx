import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { UnitNoteRoom } from '@/features/unit-note/components/unit-note-room';

export const metadata: Metadata = {
  title: '단권화 방 | 대치동',
  description: '개념별 판서, 내 노트, 관련 문제를 모아보는 단권화 방',
};

type StudentUnitNoteRoomPageProps = {
  params: Promise<{ nodeId: string }>;
};

const StudentUnitNoteRoomPage = async ({
  params,
}: StudentUnitNoteRoomPageProps) => {
  const { nodeId } = await params;
  const parsedNodeId = Number(nodeId);

  if (!Number.isInteger(parsedNodeId) || parsedNodeId <= 0) {
    notFound();
  }

  return <UnitNoteRoom rootNodeId={parsedNodeId} />;
};

export default StudentUnitNoteRoomPage;
