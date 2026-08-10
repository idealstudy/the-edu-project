import { BaseHeader } from '@/shared/components/sidebar';
import { cn } from '@/shared/lib';

type PublicStudyroomSidebarHeaderProps = {
  studyRoomName?: string;
  teacherName?: string;
  thumbnailUrl?: string | null;
  onThumbnailClick?: () => void;
  isUploading?: boolean;
  onThumbnailDelete?: () => void;
};

export const StudyroomPreviewSidebarHeader = ({
  studyRoomName,
  teacherName,
  thumbnailUrl,
  onThumbnailClick,
  onThumbnailDelete,
  isUploading,
}: PublicStudyroomSidebarHeaderProps) => {
  return (
    <BaseHeader
      studyRoomName={studyRoomName}
      teacherName={teacherName}
      thumbnailUrl={thumbnailUrl}
      onThumbnailClick={onThumbnailClick}
      isUploading={isUploading}
      onThumbnailDelete={onThumbnailDelete}
      teacherSuffix="선생님"
      fallbackStudyRoomName="스터디룸"
      titleClassName="tablet:font-headline1-heading desktop:font-title-heading truncate text-xl leading-tight font-bold"
      teacherClassName="text-gray-scale-gray-60 tablet:text-base text-sm"
      imageWrapperClassName={cn(
        thumbnailUrl ? '' : 'bg-orange-scale-orange-1',
        'tablet:h-50 relative h-37.5 w-full overflow-hidden rounded-card'
      )}
      wrapperClassName="flex flex-col gap-6"
    />
  );
};
