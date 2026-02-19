'use client';

import Link from 'next/link';

import { PRIVATE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';

import MoreButton from './more-button';

export interface HomeworkSectionContentProps {
  homeworks: {
    id: number;
    title: string;
    modDate: string;
    deadline: string;
    studyRoomId: number;
    studyRoomName?: string;
    description?: string;
  }[];
}

const getDeadlineLabel = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);

  if (deadlineDate < now) {
    return '마감';
  }

  const dday = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (dday > 0) return `마감까지 D-${dday}`;

  const dhours = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  );
  if (dhours > 0) return `마감까지 ${dhours}시간 전`;

  const dminutes = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60)
  );
  return `마감까지 ${dminutes}분 전`;
};

const HomeworkSectionContent = ({ homeworks }: HomeworkSectionContentProps) => {
  const displayHomeworks = homeworks.slice(0, 4);

  if (displayHomeworks.length === 0) {
    return (
      <div className="flex h-22 w-full flex-col items-center justify-center gap-3">
        <p className="font-body2-normal text-gray-8">미제출인 과제가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'flex w-full flex-col gap-3',
          'tablet:grid tablet:grid-cols-2 tablet:gap-5'
        )}
      >
        {displayHomeworks.map((homework, index) => {
          const deadlineLabel = getDeadlineLabel(homework.deadline);
          return (
            <Link
              key={homework.id}
              href={PRIVATE.HOMEWORK.DETAIL(homework.studyRoomId, homework.id)}
              className={cn(
                'bg-gray-white border-gray-3 flex h-[218px] flex-col gap-3 rounded-xl border px-7 pt-6 pb-7 shadow-sm transition-shadow hover:shadow-md',
                'tablet:h-[254px] tablet:pt-7',
                index >= 2 && 'tablet:flex hidden'
              )}
            >
              {/* 태그 */}
              <div className="flex justify-end">
                <span
                  className={cn(
                    'font-label-heading rounded-[4px] px-2 py-1',
                    deadlineLabel === '마감'
                      ? 'bg-gray-2 text-gray-7'
                      : 'bg-orange-2 text-orange-7'
                  )}
                >
                  {deadlineLabel}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {/* 스터디룸 이름 */}
                {homework.studyRoomName && (
                  <span className="font-label-heading text-orange-7">
                    {homework.studyRoomName}
                  </span>
                )}

                {/* 제목 */}
                <span className="font-body1-heading text-gray-12 line-clamp-2 leading-tight">
                  {homework.title}
                </span>
              </div>

              {/* 설명 */}
              {homework.description && (
                <span className="font-body2-normal text-gray-12 line-clamp-2 leading-tight">
                  {homework.description}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <MoreButton href={'#'} />
    </div>
  );
};

export default HomeworkSectionContent;
