'use client';

import { useReducer } from 'react';

import { StudentHomeworkDetail } from '@/features/homework/components/detail/student-homework-detail';
import { TeacherHomeworkDetail } from '@/features/homework/components/detail/teacher-homework-detail';
import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { useRole } from '@/shared/hooks';

type Props = {
  studyRoomId: number;
  homeworkId: number;
};

export default function HomeworkDetailRoleSwitch({
  studyRoomId,
  homeworkId,
}: Props) {
  const { role } = useRole();
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);

  if (role === 'ROLE_TEACHER') {
    return (
      <TeacherHomeworkDetail
        studyRoomId={studyRoomId}
        homeworkId={homeworkId}
        dialog={dialog}
        dispatch={dispatch}
      />
    );
  }

  return (
    <StudentHomeworkDetail
      studyRoomId={studyRoomId}
      homeworkId={homeworkId}
      dialog={dialog}
      dispatch={dispatch}
    />
  );
}
