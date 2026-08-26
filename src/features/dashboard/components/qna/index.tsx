'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PageLayout } from '@/layout';

import { QnAList } from './qna-list';

export const QnA = () => {
  const { member } = useAuth();
  const isTeacher = member?.role === 'ROLE_TEACHER';

  return (
    <PageLayout>
      <PageLayout.Header>
        <p className="font-body2-normal text-gray-8">
          {isTeacher
            ? '답변이 필요한 질문만 확인해보세요'
            : '답변 받은 질문만 확인해보세요'}
        </p>
      </PageLayout.Header>
      <QnAList isTeacher={isTeacher} />
    </PageLayout>
  );
};
