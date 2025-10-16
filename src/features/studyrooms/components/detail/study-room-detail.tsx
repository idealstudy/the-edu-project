'use client';

import { useState } from 'react';

import { ColumnLayout } from '@/components/layout/column-layout';
import QuestionListWrapper from '@/features/questions/components/detail/question-list-wrapper';

import { TAB, type TabValue } from '../common/constants/tabs';
import { StudyroomSidebar } from '../sidebar';
import { StudyNotes } from '../studynotes';
import { StudyRoomTabs } from '../tabs';

type Props = {
  studyRoomId: number;
};

export function StudyRoomDetail({ studyRoomId }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
  const [tab, setTab] = useState<TabValue>(TAB.NOTES);
  const [mode] = useState<'teacher' | 'student'>('student');

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
          mode={mode}
          studyRoomId={studyRoomId}
        />
        {tab === TAB.NOTES && <StudyNotes selectedGroupId={selectedGroupId} />}
        {tab === TAB.STUDENTS && <div>학생 리스트/컴포넌트</div>}
        {tab === TAB.QUESTIONS && mode === 'student' && (
          <QuestionListWrapper hasBorder={true} />
        )}
      </ColumnLayout.Right>
    </>
  );
}
