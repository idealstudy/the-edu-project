'use client';

import { PropsWithChildren } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { useTeacherCreateHomework } from '@/features/homework/hooks/teacher/useTeacherHomeworkMutations';
import { TeacherHomeworkRequest } from '@/features/homework/model/homework.types';
import { Form } from '@/shared/components/ui/form';
import { PRIVATE } from '@/shared/constants';

import { HomeworkForm } from '../schemas/note';

// homework
export const HomeworkWriteForm = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const studyRoomId = useWatch({ name: 'studyRoomId' });
  const { mutate } = useTeacherCreateHomework(studyRoomId);
  const { handleSubmit } = useFormContext<HomeworkForm>();

  const onSubmit = (data: HomeworkForm) => {
    const parsingData = transformHomeworkFormToServerFormat(data);

    mutate(parsingData, {
      onSuccess: () => {
        router.replace(PRIVATE.HOMEWORK.LIST(data.studyRoomId));
      },
    });
  };

  return <Form onSubmit={handleSubmit(onSubmit)}>{children}</Form>;
};

function transformHomeworkFormToServerFormat(
  formData: HomeworkForm
): TeacherHomeworkRequest {
  return {
    title: formData.title,
    content: JSON.stringify(formData.content),
    deadline: new Date(formData.deadline).toISOString(),
    studentIds: formData.studentIds?.map((s) => s.id),
    reminderOffsets: formData.reminderOffsets ?? undefined,
  };
}
