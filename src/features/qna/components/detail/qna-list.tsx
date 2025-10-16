import { useState } from 'react';

import Link from 'next/link';

import { useRole } from '@/hooks/use-role';
import { formatMMDDWeekday } from '@/lib/utils';

import { tempQuestionList } from '../../constants';
import QuestionListDropDown from './qna-list-dropdown';

type Props = {
  studyRoomId: number;
};

export default function QuestionList({ studyRoomId }: Props) {
  const { role } = useRole();
  const [open, setOpen] = useState(0);

  const handleOpen = (id: number) => {
    setOpen(open === id ? 0 : id);
  };

  // TODO: ListItem으로 변경 필요
  return (
    <div>
      {/* <ListItem
        title={'질문제목1'}
        subtitle=""
        tag={<div>피드백 대기</div>}
        id={1}
        href={`/studyrooms/${studyRoomId}/questions/${1}`}
      /> */}
      {tempQuestionList.map((question) => {
        return (
          <Link
            key={question.id}
            className="font-body2-normal hover:bg-gray-scale-gray-1 desktop:max-w-[740px] flex h-[66px] w-full flex-row items-center justify-between gap-4 bg-white px-4 py-3 hover:rounded-[12px]"
            href={`/studyrooms/${studyRoomId}/qna/${question.id}`}
          >
            <div className="flex flex-row items-center gap-3">
              <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row items-center gap-[10px]">
                  {question.feedback === 'PENDING' ? (
                    <span className="border-orange-scale-orange-50 text-orange-scale-orange-50 bg-orange-scale-orange-1 rounded-full border px-3 py-[2px]">
                      피드백 대기
                    </span>
                  ) : (
                    <span className="border-gray-scale-gray-60 text-gray-scale-gray-60 bg-gray-scale-gray-1 rounded-full border px-3 py-[2px]">
                      피드백 완료
                    </span>
                  )}
                  <p>{question.title}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-5">
              {role === 'ROLE_TEACHER' && (
                <div className="flex flex-row gap-2">
                  <div className="bg-gray-scale-gray-20 h-6 w-6 rounded-full" />
                  <p>{question.author}</p>
                </div>
              )}

              <div className="flex gap-1">
                <p className="text-gray-scale-gray-70">
                  {formatMMDDWeekday(question.createdAt)}
                </p>
                {role === 'ROLE_STUDENT' && (
                  <div
                    className="flex shrink-0 flex-row items-center"
                    onClick={(e) => e.preventDefault()}
                  >
                    <QuestionListDropDown
                      open={open}
                      handleOpen={handleOpen}
                      item={question}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
