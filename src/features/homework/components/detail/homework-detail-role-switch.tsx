'use client';

import { StudentHomeworkDetail } from '@/features/homework/components/detail/student-homework-detail';
import { TeacherHomeworkDetail } from '@/features/homework/components/detail/teacher-homework-detail';
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

  if (role === 'ROLE_TEACHER') {
    return (
      <TeacherHomeworkDetail
        studyRoomId={studyRoomId}
        homeworkId={homeworkId}
      />
    );
  }

  return (
    <StudentHomeworkDetail
      studyRoomId={studyRoomId}
      homeworkId={homeworkId}
    />
  );
}
