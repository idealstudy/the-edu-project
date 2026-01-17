import React from 'react';

import BackLink from '@/features/dashboard/studynote/components/back-link';
import CreateStudyRoomFlow from '@/features/study-rooms/components/create/CreateStudyRoomFlow';
import { ColumnLayout } from '@/layout/column-layout';

export default function CreateStudyRoomPage() {
  return (
    <div className="flex flex-col bg-[#F9F9F9]">
      <BackLink />
      <ColumnLayout className="container mx-auto">
        <CreateStudyRoomFlow />
      </ColumnLayout>
    </div>
  );
}
