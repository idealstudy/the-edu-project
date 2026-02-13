import Image from 'next/image';

type PublicStudyroomSidebarHeaderProps = {
  studyRoomName?: string;
  teacherName?: string;
};

export const PublicStudyroomSidebarHeader = ({
  studyRoomName,
  teacherName,
}: PublicStudyroomSidebarHeaderProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 텍스트 영역 */}
      <div className="flex flex-col gap-1">
        <div className="flex h-12 items-center justify-between">
          <p className="tablet:font-headline1-heading desktop:font-title-heading truncate text-[20px] leading-tight font-bold">
            {studyRoomName || 'Study Room'}
          </p>
        </div>
        {teacherName && (
          <p className="text-gray-scale-gray-60 tablet:text-base text-sm">
            {teacherName} 선생님
          </p>
        )}
      </div>

      {/* 이미지 영역 */}
      <div className="mx-auto w-full">
        <div className="tablet:h-[300px] bg-orange-scale-orange-1 relative h-[200px] w-full overflow-hidden rounded-[12px]">
          <Image
            src="/studyroom/profile.svg"
            alt="study-room-profile"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};
