import Link from 'next/link';

import { formatMMDDWeekday } from '@/lib/utils';

import { tempQuestionList } from '../../constants';

export default function QuestionList() {
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
            href={`/studyrooms/question/${question.id}`}
          >
            <div className="flex flex-row items-center gap-3">
              {/* {icon} */}
              <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row items-center gap-[10px]">
                  {question.feedback === 'DONE' ? (
                    <span className="border-orange-scale-orange-50 text-orange-scale-orange-50 bg-orange-scale-orange-1 rounded-full border px-3 py-[2px]">
                      피드백 완료
                    </span>
                  ) : (
                    <span className="border-gray-scale-gray-60 text-gray-scale-gray-60 bg-gray-scale-gray-1 rounded-full border px-3 py-[2px]">
                      피드백 대기
                    </span>
                  )}
                  <p>{question.title}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-5">
              <div className="flex flex-row gap-2">
                <div className="bg-gray-scale-gray-20 h-6 w-6 rounded-full" />
                <p>{question.author}</p>
              </div>

              <div className="gap-1">
                <p className="text-gray-scale-gray-70">
                  {formatMMDDWeekday(question.createdAt)}
                </p>
                {/* <div
                className="flex shrink-0 flex-row items-center"
                onClick={(e) => e.preventDefault()}
              >
                {dropdown}
              </div> */}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
