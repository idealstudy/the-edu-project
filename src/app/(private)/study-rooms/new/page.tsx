import React from 'react';

import BackLink from '@/features/dashboard/studynote/components/back-link';
import CreateStudyRoomFlow from '@/features/study-rooms/components/create/CreateStudyRoomFlow';
import { ColumnLayout } from '@/layout/column-layout';

export default function CreateStudyRoomPage() {
  return (
    <div className="desktop:pl-sidebar-width flex flex-col bg-[#F9F9F9]">
      {/*<Sidebar />*/}
      <div className="container mx-auto mb-6">
        <BackLink />
      </div>
      <ColumnLayout className="container mx-auto">
        <CreateStudyRoomFlow />
      </ColumnLayout>
    </div>
  );
}
