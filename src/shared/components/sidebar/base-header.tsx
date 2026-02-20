import { ReactNode } from 'react';

import Image from 'next/image';

type BaseHeaderProps = {
  studyRoomName?: string;
  teacherName?: string;
  teacherSuffix?: string;
  fallbackStudyRoomName: string;
  titleClassName?: string;
  teacherClassName?: string;
  wrapperClassName?: string;
  imageWrapperClassName?: string;
  rightSlot?: ReactNode;
};

export const BaseHeader = ({
  studyRoomName,
  teacherName,
  teacherSuffix = '',
  fallbackStudyRoomName,
  titleClassName = 'truncate text-[20px] leading-tight font-bold',
  teacherClassName = 'text-sm text-gray-scale-gray-60',
  wrapperClassName = 'flex flex-col gap-6',
  imageWrapperClassName = 'bg-orange-scale-orange-1 relative h-[200px] w-full overflow-hidden rounded-[12px]',
  rightSlot,
}: BaseHeaderProps) => {
  return (
    <div className={wrapperClassName}>
      <div className="flex flex-col gap-1">
        <div className="flex h-12 items-center justify-between">
          <p className={titleClassName}>
            {studyRoomName || fallbackStudyRoomName}
          </p>
          {rightSlot}
        </div>
        {teacherName && (
          <p className={teacherClassName}>
            {teacherName}
            {teacherSuffix ? ` ${teacherSuffix}` : ''}
          </p>
        )}
      </div>
      <div className={imageWrapperClassName}>
        <Image
          src="/studyroom/profile.svg"
          alt="study-room-profile"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};
