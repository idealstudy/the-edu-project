import { PublicStudyroomsContents } from '@/features/public-study-rooms/components/contents';
import { PublicStudyroomSidebar } from '@/features/public-study-rooms/components/sidebar';
import { ColumnLayout } from '@/layout';
import { ScrollToTopButton } from '@/shared/components/ui';

export default function StudyRoomDetailPage() {
  return (
    <>
      <ColumnLayout.Left className="border-line-line1 flex h-fit flex-col gap-5 rounded-xl border bg-white px-8 py-8">
        <PublicStudyroomSidebar />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] desktop:px-8 flex flex-col gap-3 rounded-[12px] py-2">
        <div className="border-line-line1 flex flex-col gap-9 rounded-[12px] border bg-white py-2">
          <PublicStudyroomsContents />
        </div>
      </ColumnLayout.Right>
      <ScrollToTopButton />
    </>
  );
}
