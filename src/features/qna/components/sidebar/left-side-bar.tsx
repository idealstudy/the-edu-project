'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { QnAStatus } from '../../type';

type Props = {
  status: QnAStatus;
  title: string;
};

const statusMessage = {
  PENDING: '피드백 대기중',
  COMPLETED: '피드백 완료',
};

export const QuestionLeftSidebar = ({ status, title }: Props) => {
  const image = (visibility: string) => {
    switch (visibility) {
      case 'TEACHER_ONLY':
        return (
          <Image
            src="/qna/lock.svg"
            width={14}
            height={14}
            alt="study-notes"
            className="h-[14px] w-[14px]"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
        <span
          className={cn(
            'font-body1-normal',
            status === 'PENDING'
              ? 'text-orange-scale-orange-50'
              : 'text-gray-scale-gray-60'
          )}
        >
          {statusMessage[status]}
        </span>
        <h3 className="font-headline1-heading">{title}</h3>
        <hr className="text-gray-scale-gray-10" />
        <div className="font-label-normal flex cursor-default flex-col gap-2">
          <div className="bg-gray-scale-gray-1 text-gray-scale-gray-70 flex w-fit items-center gap-1 rounded-sm px-2 py-1">
            {image('TEACHER_ONLY')}
            <span>공개범위</span>
          </div>
          <span>보호자 공개</span>
        </div>
      </div>
    </>
  );
};
