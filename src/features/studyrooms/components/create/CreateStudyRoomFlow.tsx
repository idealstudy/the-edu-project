'use client';

import React from 'react';

import { Form } from '@/components/ui/form';
import ProgressIndicator from '@/features/studyrooms/components/create/ProgressIndicator';
import StepTwo from '@/features/studyrooms/components/create/StepTwo';

export default function CreateStudyRoomFlow() {
  return (
    <>
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
    </>
  );
}
