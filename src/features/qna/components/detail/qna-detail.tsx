'use client';

import { Key } from 'react';

import Image from 'next/image';

import { ColumnLayout } from '@/shared/components/layout/column-layout';
import { useRole } from '@/shared/hooks/use-role';
import { cn } from '@/shared/lib/utils';

import { useQnADetailQuery } from '../../services/query';
import QuestionAnswer from '../sidebar/question-answer';
import QuestionContent from '../sidebar/question-content';
import QnAMessageFormProvider from '../write/qna-message-provider';
import WriteArea from '../write/qna-message-write-area';

type Props = {
  studyRoomId: number;
  contextId: number;
};

const statusMessage = {
  PENDING: '피드백 대기중',
  COMPLETED: '피드백 완료',
};

export function QuestionDetail({ studyRoomId, contextId }: Props) {
  const { role } = useRole();
  const { data: qnaDetail, isPending } = useQnADetailQuery(role, {
    studyRoomId,
    contextId,
  });

  if (isPending) return;

  return (
    <>
      <ColumnLayout.Left className="rounded-[12px] bg-white">
        <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
          <span
            className={cn(
              'font-body1-normal',
              qnaDetail?.status === 'PENDING'
                ? 'text-orange-scale-orange-50'
                : 'text-gray-scale-gray-60'
            )}
          >
            {/* TODO: 임시 타입경고 제거 */}
            {qnaDetail &&
              statusMessage[qnaDetail?.status as keyof typeof statusMessage]}
          </span>
          <h3 className="font-headline1-heading">{qnaDetail?.title}</h3>
          <hr className="text-gray-scale-gray-10" />
          <div className="font-label-normal flex cursor-default flex-col gap-2">
            <div className="bg-gray-scale-gray-1 text-gray-scale-gray-70 flex w-fit items-center gap-1 rounded-sm px-2 py-1">
              <Image
                src="/qna/lock.svg"
                width={14}
                height={14}
                alt="study-notes"
                className="h-[14px] w-[14px]"
              />
              <span>공개범위</span>
            </div>
            <span>보호자 공개</span>
          </div>
        </div>
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:min-w-[740px] flex h-[400px] w-full flex-col gap-3 rounded-[12px]">
        {qnaDetail?.messages.map(
          (msg: {
            authorType: string;
            id: Key | null | undefined;
            content: string;
            regDate: string;
            authorName: string;
          }) => {
            if (msg.authorType === 'ROLE_TEACHER')
              return (
                <QuestionAnswer
                  key={msg.id}
                  content={msg.content}
                  regDate={msg.regDate}
                />
              );
            else if (msg.authorType === 'ROLE_STUDENT')
              return (
                <QuestionContent
                  key={msg.id}
                  content={msg.content}
                  authorName={msg.authorName}
                  regDate={msg.regDate}
                />
              );
          }
        )}
        <QnAMessageFormProvider>
          <WriteArea
            studyRoomId={studyRoomId}
            contextId={contextId}
          />
        </QnAMessageFormProvider>
      </ColumnLayout.Right>
    </>
  );
}
