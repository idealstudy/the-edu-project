'use client';

import { Role } from '@/features/auth/type';
import StudentQuestionSession from '@/features/qna/components/detail/student-qna-tab';
import { Tabs } from '@/features/studyrooms/components/common/tabs';

import TeacherQuestionSession from '../../../qna/components/detail/teacher-qna-tab';
import { TabValue } from '../common/constants/tabs';
import { StudyNote } from './study-note';

type Props = {
  studyRoomId: number;
  value: TabValue;
  onChange: (v: string) => void;
  mode: Role | undefined;
};

export const StudyRoomTabs = ({
  studyRoomId,
  value,
  onChange,
  mode,
}: Props) => {
  return (
    <div>
      <Tabs
        value={value}
        onValueChange={onChange}
        defaultValue="1"
      >
        <Tabs.List>
          <Tabs.Trigger value="1">
            {/* <Icon.Notebook /> */}
            수업노트
          </Tabs.Trigger>
          <Tabs.Trigger value="2">
            {/* <Icon.Person /> */}
            학생
          </Tabs.Trigger>
          <Tabs.Trigger value="3">
            {/* <Icon.Question /> */}
            질문
          </Tabs.Trigger>
        </Tabs.List>
        <div className="border-line-line1 rounded-tr-[12px] rounded-b-[12px] border bg-white p-8">
          <Tabs.Content
            value="1"
            className="flex flex-col gap-8"
          >
            <StudyNote />
          </Tabs.Content>
          <Tabs.Content value="2">
            <p>학생</p>
          </Tabs.Content>
          <Tabs.Content value="3">
            {mode === 'ROLE_TEACHER' && (
              <TeacherQuestionSession studyRoomId={studyRoomId} />
            )}
            {mode === 'ROLE_STUDENT' && <StudentQuestionSession />}
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};
