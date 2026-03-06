import Link from 'next/link';

import { StudentDashboardQnaListItemDTO } from '@/entities/student';
import { TeacherDashboardQnaListItemDTO } from '@/entities/teacher';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { PRIVATE } from '@/shared/constants';
import { cn, getRelativeTimeString } from '@/shared/lib';
import { trackDashboardQnaClick } from '@/shared/lib/gtm/trackers';
import { Check } from 'lucide-react';

interface QnASectionListItemProps {
  question: TeacherDashboardQnaListItemDTO | StudentDashboardQnaListItemDTO;
}

export const QnASectionListItem = ({ question }: QnASectionListItemProps) => {
  const { member } = useAuth();

  const isTeacher = member?.role === 'ROLE_TEACHER';

  return (
    <Link
      key={question.id}
      href={PRIVATE.QUESTIONS.DETAIL(question.studyRoomId, question.id)}
      className={cn(
        'bg-gray-white hover:bg-gray-1 flex w-full flex-col gap-2 rounded-lg p-3'
      )}
      onClick={() =>
        trackDashboardQnaClick(question.studyRoomId, question.id, member?.role)
      }
    >
      {/* 스터디룸 이름 : 수정 필요 */}
      <span className="font-caption-heading text-orange-7">
        {question.studyRoomName}
      </span>

      {/* 질문 내용 / 제목 */}
      <span className="font-body2-normal text-gray-12 line-clamp-2 leading-tight">
        {question.title}
      </span>

      {/* 질문 학생, 시간, 답변 상태 */}
      <div className="flex items-center gap-2 pt-1">
        {/* 왼쪽: 선생님이면 학생 정보, 학생이면 '나의 질문' */}
        <span className="font-caption-heading text-gray-12">
          {isTeacher ? question.studentName : '나의 질문'}
        </span>

        {/* 오른쪽: 시간 + 답변 상태 배지 */}
        <div className="flex items-center gap-2">
          <span className="font-caption-normal text-gray-7">
            {getRelativeTimeString(question.regDate)}
          </span>
          {!isTeacher && (
            <span
              className={cn(
                'font-caption-heading bg-system-success-alt text-system-success flex items-center gap-0.5 rounded-[4px] px-1.5 py-1'
              )}
            >
              답변 완료
              <Check className="h-4 w-4 shrink-0" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
