'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { QnAListItem } from '@/features/qna/types';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { getRelativeTimeString } from '@/shared/lib/utils';
import { Check } from 'lucide-react';

import MoreButton from './more-button';

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
      <div className="flex w-full flex-col gap-3">
        {questions.map((question) => {
          const isCompleted = question.status === 'COMPLETED';
          return (
            <Link
              key={question.id}
              href={PRIVATE.QUESTIONS.DETAIL(studyRoomId, question.id)}
              className={cn(
                'bg-gray-white border-gray-3 flex w-full flex-col gap-2 rounded-xl border px-7 py-6 shadow-sm transition-shadow hover:shadow-md'
              )}
            >
              {/* 스터디룸 이름 */}
              <span className="font-label-heading text-orange-7">
                {studyRoomName || '스터디룸'}
              </span>

              {/* 질문 내용 / 제목 */}
              <span className="font-body1-heading text-gray-12 line-clamp-2 leading-tight">
                {question.title || question.content}
              </span>

              {/* 질문 학생, 답변 유무, 시간 */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {isTeacher && (
                    <>
                      <div className="bg-gray-white border-gray-12 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                        <Image
                          src="/character/img_profile_student01.png"
                          alt=""
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className="font-body2-normal text-gray-12">
                        {question.authorName}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* 답변 상태 배지 */}
                  {!isTeacher && (
                    <span
                      className={cn(
                        'font-label-heading flex items-center gap-1 rounded-[4px] px-2 py-1',
                        isCompleted
                          ? 'bg-system-success-alt text-system-success'
                          : 'bg-gray-2 text-gray-7'
                      )}
                    >
                      {isCompleted ? (
                        <>
                          답변 완료
                          <Check className="h-4 w-4 shrink-0" />
                        </>
                      ) : (
                        '답변 전'
                      )}
                    </span>
                  )}
                  <span className="font-caption-normal text-gray-7">
                    {getRelativeTimeString(question.regDate)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <MoreButton
        href={studyRoomId ? PRIVATE.QUESTIONS.LIST(studyRoomId) : '#'}
      />
    </div>
  );
};

export default QnASectionContent;
