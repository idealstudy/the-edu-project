'use client';

import { PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { useTeacherUpdateHomework } from '@/features/homework/hooks/teacher/useTeacherHomeworkMutations';
import { Form } from '@/shared/components/ui/form';
import { ShowErrorToast, getApiError } from '@/shared/lib';

import { HomeworkForm } from '../schemas/note';

type EditFormProps = {
  homeworkId: number;
  studyRoomId: number;
};

const HomeworkEditForm = ({
  children,
  homeworkId,
  studyRoomId,
}: PropsWithChildren<EditFormProps>) => {
  const router = useRouter();
  const { mutate: updateHomework } = useTeacherUpdateHomework();
  const { handleSubmit } = useFormContext<HomeworkForm>();

  const onSubmit = (data: HomeworkForm) => {
    const parsingData = transformFormDataToServerFormat(data);

    updateHomework(
      {
        studyRoomId,
        homeworkId,
        body: {
          title: parsingData.title,
          content: parsingData.content,
          deadline: parsingData.deadline,
          reminderOffsets: parsingData.reminderOffsets,
          teachingNoteIds: parsingData.teachingNoteIds,
          studentIds: parsingData.studentIds,
        },
      },
      {
        onSuccess: () => {
          router.replace(`/study-rooms/${studyRoomId}/homework/${homeworkId}`);
        },
        onError: (error) => {
          const apiError = getApiError(error);

          if (!apiError) {
            ShowErrorToast('API_ERROR', '과제 수정에 실패했습니다.');
            return;
          }

          ShowErrorToast('API_ERROR', apiError.message);
        },
      }
    );
  };

  return <Form onSubmit={handleSubmit(onSubmit)}>{children}</Form>;
};

function transformFormDataToServerFormat(formData: HomeworkForm) {
  return {
    title: formData.title,
    content: JSON.stringify(formData.content),
    deadline: formData.deadline,
    reminderOffsets: formData.reminderOffsets ?? [],
    teachingNoteIds: formData.teachingNoteIds ?? [],
    studentIds: formData.studentIds?.map((s) => s.id) ?? [],
  };
}

export default HomeworkEditForm;
