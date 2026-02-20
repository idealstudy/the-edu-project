'use client';

import { ReactNode } from 'react';

import { cn } from '@/shared/lib';

interface TeacherInfoBlockProps {
  teacherName: string;
  showNewBadge?: boolean;
  subjectLabel?: string;
  className?: string;
  showDivider?: boolean;
  footer?: ReactNode;
}

export const TeacherInfoBlock = ({
  teacherName,
  showNewBadge = false,
  // subjectLabel = '영어',
  className,
  showDivider = false,
  footer,
}: TeacherInfoBlockProps) => {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[8px]', className)}>
      <div className="flex gap-2">
        {showNewBadge && (
          <div className="bg-orange-7 font-label-heading h-[27px] w-[47px] rounded-full px-2 py-1 text-white">
            NEW
          </div>
        )}
        {/* TODO : 추후 업데이트 이후 적용 예정 */}
        {/* <div className="bg-orange-2 text-orange-7 font-label-heading flex w-fit items-center justify-center rounded-[4px] px-[8px] py-[4px]">
          {subjectLabel}
        </div> */}
      </div>

      <div className="font-body1-heading text-gray-12 truncate text-lg md:text-xl">
        {teacherName} 선생님
      </div>

      {showDivider && <hr className="my-1 border-gray-100" />}
      {footer}
    </div>
  );
};
