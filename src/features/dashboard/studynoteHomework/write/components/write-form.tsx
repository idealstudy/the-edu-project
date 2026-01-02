'use client';

import { PropsWithChildren } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { useCreateHomework } from '@/features/homework/hooks/teacher/useCreateHomework';
import { TeacherHomeworkRequest } from '@/features/homework/model/homework.types';
import { Form } from '@/shared/components/ui/form';
import { PRIVATE } from '@/shared/constants';

import { STUDY_NOTE_VISIBILITY } from '../../constant';
import { StudyNoteVisibility } from '../../type';
import { HomeworkForm, StudyNoteForm } from '../schemas/note';
import { useWriteStudyNoteMutation } from '../services/query';

// studynote
export const StudyNoteWriteForm = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const { mutate } = useWriteStudyNoteMutation();
  const { handleSubmit } = useFormContext<StudyNoteForm>();

  const onSubmit = (data: StudyNoteForm) => {
    const parsingData = transformFormDataToServerFormat(data);
    mutate(parsingData, {
      onSuccess: () => {
        const roomId = data.studyRoomId;
        router.replace(PRIVATE.NOTE.LIST(roomId));
      },
    });
  };

  return <Form onSubmit={handleSubmit(onSubmit)}>{children}</Form>;
};

function transformVisibility(
  visibility: StudyNoteVisibility,
  isGuardianVisible: boolean
): StudyNoteVisibility {
  const visibilityMap: Partial<
    Record<StudyNoteVisibility, StudyNoteVisibility>
  > = {
    [STUDY_NOTE_VISIBILITY.SPECIFIC_STUDENTS_ONLY]:
      STUDY_NOTE_VISIBILITY.SPECIFIC_STUDENTS_AND_PARENTS,
    [STUDY_NOTE_VISIBILITY.STUDY_ROOM_STUDENTS_ONLY]:
      STUDY_NOTE_VISIBILITY.STUDY_ROOM_STUDENTS_AND_PARENTS,
  };

  return isGuardianVisible && visibilityMap[visibility]
    ? visibilityMap[visibility]
    : visibility;
}

function transformFormDataToServerFormat(formData: StudyNoteForm) {
  const isGuardianVisible = formData.isGuardianVisible ?? false;

  return {
    studyRoomId: formData.studyRoomId,
    title: formData.title,
    content: JSON.stringify(formData.content),
    visibility: transformVisibility(
      formData.visibility as StudyNoteVisibility,
      isGuardianVisible
    ),
    taughtAt: new Date(formData.taughtAt).toISOString(),
    studentIds: formData.studentIds?.map((student) => student.id),
    teachingNoteGroupId: formData.teachingNoteGroupId,
  };
}

// homework
export const HomeworkWriteForm = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const studyRoomId = useWatch({ name: 'studyRoomId' });
  const { mutate } = useCreateHomework(studyRoomId);
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
