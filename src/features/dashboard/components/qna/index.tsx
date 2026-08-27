'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PageLayout } from '@/layout';

import { QnAList } from './qna-list';

export const QnA = () => {
  const { member } = useAuth();
  const isTeacher = member?.role === 'ROLE_TEACHER';

  return (
    // DESIGN.md §4.2: 대시보드 질문 화면 = 표준 셸(max-w-shell, 1200px)로
    // 학생 대시보드 나머지 화면과 통일한다. PageLayout 기본 폭(page, 1180px)이
    // 걸려 있던 것을 오적용으로 보고 제거했다.
    <div className="mx-auto w-full max-w-shell">
      <PageLayout width="fluid">
        <PageLayout.Header>
          <p className="font-body2-normal text-gray-8">
            {isTeacher
              ? '답변이 필요한 질문만 확인해보세요'
              : '답변 받은 질문만 확인해보세요'}
          </p>
        </PageLayout.Header>
        <QnAList isTeacher={isTeacher} />
      </PageLayout>
    </div>
  );
};
