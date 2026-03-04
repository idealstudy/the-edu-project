'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useStudentDashboardQnaListQuery,
  useTeacherDashboardQnaListQuery,
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
    size: 3,
    sortKey: 'LATEST',
    enabled: isTeacher,
  });
  const { data: studentQnaData } = useStudentDashboardQnaListQuery({
    page: 0,
    size: 3,
    sortKey: 'LATEST',
    enabled: !isTeacher,
  });

  const questions =
    (isTeacher ? teacherQnaData : studentQnaData)?.content ?? [];

  return (
    <DashboardSection
      title={isTeacher ? '답변이 필요한 질문' : '나의 질문'}
      description={
        isTeacher ? '아직 답변하지 않은 질문만 추렸어요.' : undefined
      }
      className={className}
      isMore={true}
      isMoreHref="/dashboard/qna"
    >
      <QnASectionContent questions={questions} />
    </DashboardSection>
  );
};

export default QnASection;
