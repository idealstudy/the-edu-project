'use client';

import { useState } from 'react';

import { ColumnLayout } from '@/components/layout/column-layout';
import QuestionListWrapper from '@/features/qna/components/detail/qna-list-wrapper';
import { useRole } from '@/hooks/use-role';

import { TAB, type TabValue } from '../common/constants/tabs';
import { StudyroomSidebar } from '../sidebar';
import { StudyNotes } from '../studynotes';
import { StudyRoomTabs } from '../tabs';

type Props = {
  studyRoomId: number;
};

export function StudyRoomDetail({ studyRoomId }: Props) {
  const { role } = useRole();
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
  const [tab, setTab] = useState<TabValue>(TAB.NOTES);

  const onTabChange = (v: string) => setTab(v as TabValue);

  const handleSelectGroupId = (id: number | 'all') => {
    setSelectedGroupId(id);
  };

  return (
    <>
      <ColumnLayout.Left className="rounded-[12px] bg-gray-200">
        <StudyroomSidebar
          studyRoomId={Number(studyRoomId)}
          selectedGroupId={selectedGroupId}
          handleSelectGroupId={handleSelectGroupId}
          currTab={tab}
        />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] flex h-[400px] flex-col gap-3 rounded-[12px] px-8">
        <StudyRoomTabs
          value={tab}
          onChange={onTabChange}
          mode={role}
          studyRoomId={studyRoomId}
        />
        {tab === TAB.NOTES && <StudyNotes selectedGroupId={selectedGroupId} />}
        {tab === TAB.STUDENTS && <div> </div>}
        {tab === TAB.QUESTIONS && role === 'ROLE_STUDENT' && (
          <QuestionListWrapper
            hasBorder={true}
            studyRoomId={studyRoomId}
          />
        )}
      </ColumnLayout.Right>
    </>
  );
}
