'use client';

import StudentQuestionSession from '@/features/questions/components/detail/student-question';
import { Tabs } from '@/features/studyrooms/components/common/tabs';

import TeacherQuestionSession from '../../../questions/components/detail/teacher-question';
import { TabValue } from '../common/constants/tabs';
import { StudyNote } from './study-note';

type Props = {
  studyRoomId: number;
  value: TabValue;
  onChange: (v: string) => void;
  mode: 'teacher' | 'student';
};

export const StudyRoomTabs = ({ value, onChange, mode }: Props) => {
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
            {/* TODO: 선생님/학생/부모님 역할에 따른 다른 컴포넌트 표시 */}
            {mode === 'teacher' && <TeacherQuestionSession />}
            {mode === 'student' && <StudentQuestionSession />}
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};
