'use client';

import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useConnectMembers } from '@/features/dashboard/studynote/write/services/query';
import { useGetTeacherHomeworkDetail } from '@/features/homework/hooks/teacher/useTeacherHomeworkQuries';
import { useGetTeacherNotesList } from '@/features/study-notes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { HomeworkForm, HomeworkFormSchema } from '../schemas/note';

export const HomeworkFormProvider = ({
  studyRoomId,
  homeworkId,
  isEditMode = false,
  children,
}: {
  studyRoomId: number;
  homeworkId?: number;
  isEditMode?: boolean;
  children: React.ReactNode;
}) => {
  /* 과제 상세 */
  const { data: homeworkDetail, isPending } = useGetTeacherHomeworkDetail(
    studyRoomId,
    homeworkId!
  );

  /* 수업노트 목록 */
  const { data: notes } = useGetTeacherNotesList({
    studyRoomId,
    pageable: { page: 0, size: 20, sortKey: 'LATEST_EDITED' },
    enabled: !!studyRoomId,
  });

  /* 학생 목록 */
  const { data: members } = useConnectMembers(studyRoomId);

  const methods = useForm<HomeworkForm>({
    resolver: zodResolver(HomeworkFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: {},
      deadline: new Date().toISOString().split('T')[0],
      studentIds: [],
      reminderOffsets: [],
      teachingNoteIds: [],
      studyRoomId,
    },
  });

  /*  edit 모드 초기화  */
  useEffect(() => {
    if (!isEditMode || !homeworkDetail || !members || !notes || isPending)
      return;

    const { homework } = homeworkDetail;

    const contentString = homework.resolvedContent?.content || homework.content;
    let content;
    try {
      content = JSON.parse(contentString);
    } catch {
      content = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
    }

    methods.reset({
      title: homework.title,
      content,
      deadline: homework.deadline.split('T')[0],
      teachingNoteIds: homework.teachingNoteInfoList.map((n) => n.id),
      studentIds: homeworkDetail.homeworkStudents.map((hs) => {
        const member = members.find((m) => m.id === hs.studentId);

        return {
          id: hs.studentId,
          name: hs.studentName,
          parentCount: member?.parentCount ?? 0,
          role: 'ROLE_STUDENT',
        };
      }),
      reminderOffsets: homework.reminderOffsets ?? [],
      studyRoomId,
    });
  }, [
    isEditMode,
    homeworkDetail,
    members,
    notes,
    isPending,
    methods,
    studyRoomId,
  ]);

  if (isEditMode && isPending) {
    return <div>로딩 중...</div>;
  }

  return <FormProvider {...methods}>{children}</FormProvider>;
};
