'use client';

import { useState } from 'react';

import { ColumnLayout } from '@/components/layout/column-layout';

import { StudyroomSidebar } from '../sidebar';
import { StudyNotes } from '../studynotes';
import { StudyRoomTabs } from '../tabs';

type ClientStudyRoomDetailProps = {
  roomId: number;
};

export function ClientStudyRoomDetail({ roomId }: ClientStudyRoomDetailProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');

  const handleSelectGroupId = (id: number | 'all') => {
    setSelectedGroupId(id);
  };
  return (
    <>
      <ColumnLayout.Left className="rounded-[12px] bg-gray-200">
        <StudyroomSidebar
          studyRoomId={Number(roomId)}
          selectedGroupId={selectedGroupId}
          handleSelectGroupId={handleSelectGroupId}
        />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] flex h-[400px] flex-col gap-3 rounded-[12px] px-8">
        <StudyRoomTabs />
        <StudyNotes selectedGroupId={selectedGroupId} />
      </ColumnLayout.Right>
    </>
  );
}
