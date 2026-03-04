'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useStudentDashboardQnaListQuery,
  useStudentDashboardStudyRoomListQuery,
  useTeacherDashboardQnaListQuery,
  useTeacherDashboardStudyRoomListQuery,
} from '@/features/dashboard/hooks/use-dashboard-query';

import QnASectionContent from '../section-content/qna-section-content';
import DashboardSection from './single-section';

type Props = {
  className?: string;
};

const QnASection = ({ className }: Props) => {
  const { member } = useAuth();
  const isTeacher = member?.role === 'ROLE_TEACHER';
  const { data: teacherQnaData } = useTeacherDashboardQnaListQuery({
    page: 0,
    size: 4,
    sortKey: 'LATEST',
    enabled: isTeacher,
  });
  const { data: studentQnaData } = useStudentDashboardQnaListQuery({
    page: 0,
    size: 4,
    sortKey: 'LATEST',
    enabled: !isTeacher,
  });
  const { data: teacherRooms } = useTeacherDashboardStudyRoomListQuery({
    enabled: isTeacher,
  });
  const { data: studentRooms } = useStudentDashboardStudyRoomListQuery({
    enabled: !isTeacher,
  });

  const questions =
    (isTeacher ? teacherQnaData : studentQnaData)?.content ?? [];
  const rooms = isTeacher ? teacherRooms : studentRooms;
  const firstStudyRoomId = rooms?.[0]?.id ?? 0;

  return (
    <DashboardSection
      title={isTeacher ? '답변이 필요한 질문' : '나의 질문'}
      description={
        isTeacher ? '아직 답변하지 않은 질문만 추렸어요.' : undefined
      }
      className={className}
    >
      <QnASectionContent
        questions={questions}
        studyRoomId={firstStudyRoomId}
      />
    </DashboardSection>
  );
};

export default QnASection;
