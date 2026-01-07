'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { HomeworkFeedbackForm } from '../schemas/create';
import { FeedbackWriteArea } from './Feedback-write-area';

type HomeworkContentProps = {
  studyRoomId: number;
  homeworkStudentId: number;
  homeworkId: number;
  setIsClicked: (set: boolean) => void;
};

export const FeedbackFormProvider = ({
  studyRoomId,
  homeworkStudentId,
  homeworkId,
  setIsClicked,
}: HomeworkContentProps) => {
  const methods = useForm<HomeworkFeedbackForm>({
    mode: 'onChange',
    defaultValues: {
      content: {},
      studyRoomId,
      homeworkStudentId,
      homeworkId,
    },
  });

  return (
    <FormProvider {...methods}>
      <FeedbackWriteArea
        studyRoomId={studyRoomId}
        homeworkStudentId={homeworkStudentId}
        homeworkId={homeworkId}
        setIsClicked={setIsClicked}
      />
    </FormProvider>
  );
};
