'use client';

import { useState } from 'react';

import Image from 'next/image';

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useRole } from '@/hooks/use-role';
import { extractText, getRelativeTimeString } from '@/lib/utils';

type Props = {
  content: string;
  regDate: string;
};

const QuestionAnswer = ({ content, regDate }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useRole();

  return (
    <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white px-8 py-8">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <Image
            src="/qna/reply.svg"
            width={56}
            height={24}
            alt="replay icon"
          />
          <span className="font-body2-heading">선생님 답글</span>
        </div>
        {role === 'ROLE_TEACHER' && (
          <DropdownMenu
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <DropdownMenu.Trigger className="flex size-8 cursor-pointer items-center justify-center">
              <Image
                src="/studynotes/gray-kebab.svg"
                width={24}
                height={24}
                alt="study-notes"
                className="cursor-pointer"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="flex min-w-[110px] flex-col items-stretch">
              <DropdownMenu.Item className="justify-center">
                수정
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="justify-center"
                variant="danger"
              >
                삭제
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>
      <p className="font-body2-normal whitespace-pre-line">
        {extractText(content)}
      </p>
      <span className="font-caption-normal text-gray-scale-gray-60 self-end">
        {getRelativeTimeString(regDate) + ' 작성'}
      </span>
    </div>
  );
};

export default QuestionAnswer;
