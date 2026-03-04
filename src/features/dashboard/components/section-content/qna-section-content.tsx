'use client';

import { StudentDashboardQnaListItemDTO } from '@/entities/student';
import { TeacherDashboardQnaListItemDTO } from '@/entities/teacher';
import { useAuth } from '@/features/auth/hooks/use-auth';

import { QnASectionListItem } from './qna-section-list-item';

export interface QnASectionContentProps {
  questions:
    | TeacherDashboardQnaListItemDTO[]
    | StudentDashboardQnaListItemDTO[];
  studyRoomId?: number;
  studyRoomName?: string;
}

const QnASectionContent = ({
  questions,
  studyRoomId = 0,
}: QnASectionContentProps) => {
  const { member } = useAuth();
  const isTeacher = member?.role === 'ROLE_TEACHER';
  if (studyRoomId === 0) {
    return (
      <div className="flex h-22 w-full flex-col items-center justify-center gap-3">
        <p className="font-body2-normal text-gray-8">
          {isTeacher
            ? '상단을 참고해 스터디룸을 생성하고 학생을 초대한 후, 이용할 수 있어요.'
            : '참여 중인 스터디룸에서 질문을 확인할 수 있어요.'}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-22 w-full flex-col items-center justify-center gap-3">
        <p className="font-body2-normal text-gray-8">
          {isTeacher ? '아직 도착한 질문이 없어요.' : '작성한 질문이 없어요.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-1">
        {questions.map((question) => {
          return (
            <QnASectionListItem
              key={question.id}
              question={question}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QnASectionContent;
