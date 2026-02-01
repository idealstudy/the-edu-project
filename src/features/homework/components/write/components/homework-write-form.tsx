'use client';

import { PropsWithChildren } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { useTeacherCreateHomework } from '@/features/homework/hooks/teacher/useTeacherHomeworkMutations';
import { TeacherHomeworkRequest } from '@/features/homework/model/homework.types';
import { prepareContentForSave } from '@/shared/components/editor';
import { Form } from '@/shared/components/ui/form';
import { PRIVATE } from '@/shared/constants';
import { ShowErrorToast, getApiError } from '@/shared/lib';

import { HomeworkForm } from '../schemas/note';

// homework
export const HomeworkWriteForm = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const studyRoomId = useWatch({ name: 'studyRoomId' });

  const { mutate } = useTeacherCreateHomework();
  const { handleSubmit } = useFormContext<HomeworkForm>();

  const onSubmit = (data: HomeworkForm) => {
    const parsingData = transformHomeworkFormToServerFormat(data);

    mutate(
      {
        studyRoomId,
        body: parsingData,
      },
      {
        onSuccess: () => {
          router.replace(PRIVATE.HOMEWORK.LIST(studyRoomId));
        },
        onError: (error) => {
          const apiError = getApiError(error);

          if (!apiError) {
            ShowErrorToast('API_ERROR', '과제 제출에 실패했습니다.');
            return;
          }

          ShowErrorToast('API_ERROR', apiError.message);
        },
      }
    );
  };

  return <Form onSubmit={handleSubmit(onSubmit)}>{children}</Form>;
};

function transformHomeworkFormToServerFormat(
  formData: HomeworkForm
): TeacherHomeworkRequest {
  const { contentString, mediaIds } = prepareContentForSave(formData.content);

  return {
    title: formData.title,
    content: contentString,
    deadline: normalizeDeadline(formData.deadline),
    studentIds: formData.studentIds?.map((s) => s.id),
    reminderOffsets: formData.reminderOffsets ?? undefined,
    teachingNoteIds: formData.teachingNoteIds ?? [],
    mediaIds,
  };
}

function normalizeDeadline(value: string) {
  // "2026-02-01T08:50" → "2026-02-01T08:50:00"
  return value.length === 16 ? `${value}:00` : value;
}
