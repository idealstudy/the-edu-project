'use client';

import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useGetTeacherHomeworkDetail } from '@/features/homework/hooks/teacher/useGetTeacherHomeworkDetail';
import { zodResolver } from '@hookform/resolvers/zod';

import { HomeworkForm, HomeworkFormSchema } from '../schemas/note';

export const RequiredMark = () => {
  return <span className="text-key-color-primary"> *</span>;
};

// 과제
export const HomeworkFormProvider = ({
  defaultStudyRoomId,
  homeworkId,
  isEditMode = false,
  children,
}: {
  defaultStudyRoomId: number;
  homeworkId?: number;
  isEditMode?: boolean;
  children: React.ReactNode;
}) => {
  // 편집 모드일 때 기존 데이터 조회
  const { data: homeworkDetail, isLoading } = useGetTeacherHomeworkDetail(
    defaultStudyRoomId,
    homeworkId!
  );

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
      studyRoomId: defaultStudyRoomId,
    },
  });
  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (!isEditMode || !homeworkDetail || isLoading) return;

    const { homework, homeworkStudents } = homeworkDetail;

    let content = {};
    try {
      content = JSON.parse(homework.content);
    } catch {
      content = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
    }

    methods.reset({
      title: homework.title,
      content,
      deadline: homework.deadline
        ? homework.deadline.split('T')[0]
        : new Date().toISOString().split('T')[0],
      studentIds: homeworkStudents?.map((s) => ({ id: s.id })) ?? [],
      // TODO: reminderOffsets, teachingNoteIds 서버에서 받아오기
      reminderOffsets: [],
      teachingNoteIds: [],
      studyRoomId: defaultStudyRoomId,
    });
  }, [isEditMode, homeworkDetail, isLoading, methods, defaultStudyRoomId]);

  if (isEditMode && isLoading) {
    return <div>로딩 중...</div>;
  }

  return <FormProvider {...methods}>{children}</FormProvider>;
};
