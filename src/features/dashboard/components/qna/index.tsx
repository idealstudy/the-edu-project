'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';

import { QnAHeader } from './qna-header';
import { QnAList } from './qna-list';

export const QnA = () => {
  const { member } = useAuth();
  const isTeacher = member?.role === 'ROLE_TEACHER';

  return (
    <div className="flex min-h-[calc(100vh-var(--spacing-header-height))] w-full flex-col">
      <QnAHeader isTeacher={isTeacher} />
      <QnAList isTeacher={isTeacher} />
    </div>
  );
};
