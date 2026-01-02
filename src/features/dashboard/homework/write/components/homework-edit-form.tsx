'use client';

import { PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { useTeacherUpdateTeacherHomework } from '@/features/homework/hooks/teacher/useTeacherHomeworkMutations';
import { TeacherHomeworkQueryKey } from '@/features/homework/service/query-keys';
import { Form } from '@/shared/components/ui/form';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const { mutate: updateHomework } = useTeacherUpdateTeacherHomework(
    studyRoomId,
    homeworkId
  );
  const { handleSubmit } = useFormContext<HomeworkForm>();

  const onSubmit = (data: HomeworkForm) => {
    const parsingData = transformFormDataToServerFormat(data);
    updateHomework(
      {
        title: parsingData.title,
        content: parsingData.content,
        deadline: parsingData.deadline,
        reminderOffsets: parsingData.reminderOffsets,
        studentIds: parsingData.studentIds,
      },
      {
        onSuccess: async () => {
          // 상세 과제 무효화
          await queryClient.invalidateQueries({
            queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
          });

          // 과제 목록 무효화
          await queryClient.invalidateQueries({
            queryKey: TeacherHomeworkQueryKey.listBase(studyRoomId),
          });

          router.replace(`/study-rooms/${studyRoomId}/homework`);
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
    deadline: new Date(formData.deadline).toISOString(),
    reminderOffsets: formData.reminderOffsets ?? [],
    studentIds: formData.studentIds?.map((s) => s.id) ?? [],
  };
}

export default HomeworkEditForm;
