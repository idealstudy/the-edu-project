'use client';

import Link from 'next/link';

import type { QnAListItem } from '@/features/qna/types';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { getRelativeTimeString } from '@/shared/lib/utils';
import { Check } from 'lucide-react';

export interface QnASectionContentProps {
  isTeacher: boolean;
  questions: QnAListItem[];
  studyRoomId?: number;
  studyRoomName?: string;
}

const QnASectionContent = ({
  isTeacher,
  questions,
  studyRoomId = 0,
  studyRoomName = '',
}: QnASectionContentProps) => {
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
            <Link
              key={question.id}
              href={PRIVATE.QUESTIONS.DETAIL(studyRoomId, question.id)}
              className={cn(
                'bg-gray-white hover:bg-gray-1 flex w-full flex-col gap-2 p-3'
              )}
            >
              {/* 스터디룸 이름 */}
              <span className="font-caption-heading text-orange-7">
                {studyRoomName || '스터디룸'}
              </span>

              {/* 질문 내용 / 제목 */}
              <span className="font-body2-normal text-gray-12 line-clamp-2 leading-tight">
                {question.title || question.content}
              </span>

              {/* 질문 학생, 시간, 답변 상태 */}
              <div className="flex items-center gap-2 pt-1">
                {/* 왼쪽: 선생님이면 학생 정보, 학생이면 '나의 질문' */}
                <span className="font-caption-heading text-gray-12">
                  {isTeacher ? question.authorName : '나의 질문'}
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
        })}
      </div>
    </div>
  );
};

export default QnASectionContent;
