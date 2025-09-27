'use client';

import React from 'react';

import { ColumnLayout } from '@/components/layout/column-layout';
//import StepThree from '@/features/studyrooms/components/create/StepThree';
import { Form } from '@/components/ui/form';
import ProgressIndicator from '@/features/studyrooms/components/create/ProgressIndicator';
//import StepOne from '@/features/studyrooms/components/create/StepOne';
import StepTwo from '@/features/studyrooms/components/create/StepTwo';

export default function CreateStudyRoomPage() {
  return (
    <main>
      <ColumnLayout>
        <ProgressIndicator />
        <h2>스터디룸 만들기</h2>
        <Form
          onSubmit={(e: { preventDefault: () => void }) => {
            e.preventDefault();
          }}
        >
          {/*<StepOne />*/}
          <StepTwo />
          {/*<StepThree />*/}
        </Form>
      </ColumnLayout>
    </main>
  );
}
