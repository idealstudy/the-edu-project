import React from 'react';

import { ColumnLayout } from '@/components/layout/column-layout';
import ProgressIndicator from '@/features/studyrooms/components/create/ProgressIndicator';
import StepOne from '@/features/studyrooms/components/create/StepOne';

export default function CreateStudyRoomPage() {
  return (
    <main>
      <ColumnLayout>
        <ProgressIndicator />
        <h2>스터디룸 만들기</h2>
        <StepOne />
      </ColumnLayout>
    </main>
  );
}
