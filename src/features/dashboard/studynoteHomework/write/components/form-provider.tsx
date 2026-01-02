'use client';

import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useStudyNoteDetailQuery } from '@/features/dashboard/studynoteHomework/detail/service/query';
import { useGetTeacherHomeworkDetail } from '@/features/homework/hooks/teacher/useGetTeacherHomeworkDetail';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  HomeworkForm,
  HomeworkFormSchema,
  StudyNoteForm,
  studyNoteFormSchema,
} from '../schemas/note';

export const RequiredMark = () => {
  return <span className="text-key-color-primary"> *</span>;
};

// 스터디 노트
export const StudyNoteFormProvider = ({
  defaultStudyRoomId,
  noteId,
  isEditMode = false,
  children,
}: {
  defaultStudyRoomId: number;
  noteId?: number;
  isEditMode?: boolean;
  children: React.ReactNode;
}) => {
  // 편집 모드일 때 기존 데이터 조회
  const { data: noteDetail, isLoading } = useStudyNoteDetailQuery(noteId!, {
    enabled: isEditMode && !!noteId,
  });

  const methods = useForm<StudyNoteForm>({
    resolver: zodResolver(studyNoteFormSchema),
    defaultValues: {
      title: '',
      content: {},
      studentIds: [],
      studyRoomId: defaultStudyRoomId,
      taughtAt: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && noteDetail && !isLoading) {
      const contentString =
        noteDetail.resolvedContent?.content || noteDetail.content;
      let content = {};
      try {
        content = JSON.parse(contentString);
      } catch {
        // 파싱 실패 시 기본값 사용
        content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
            },
          ],
        };
      }

      // visibility 변환: 'PUBLIC' | 'PRIVATE' -> 폼 스키마 타입
      const visibility =
        noteDetail.visibility === 'PRIVATE'
          ? 'TEACHER_ONLY'
          : noteDetail.visibility;

      const formData = {
        title: noteDetail.title,
        content,
        studentIds: noteDetail.studentInfos.map((info) => ({
          id: info.studentId,
        })),
        studyRoomId: noteDetail.studyRoomId,
        taughtAt: new Date(noteDetail.taughtAt).toISOString().split('T')[0],
        visibility: visibility as
          | 'TEACHER_ONLY'
          | 'SPECIFIC_STUDENTS_ONLY'
          | 'SPECIFIC_STUDENTS_AND_PARENTS'
          | 'STUDY_ROOM_STUDENTS_ONLY'
          | 'STUDY_ROOM_STUDENTS_AND_PARENTS'
          | 'PUBLIC',
        teachingNoteGroupId: noteDetail.groupId ?? undefined,
      };

      methods.reset(formData);
    }
  }, [isEditMode, noteDetail, isLoading, methods]);

  if (isEditMode && isLoading) {
    return <div>로딩 중...</div>;
  }

  return <FormProvider {...methods}>{children}</FormProvider>;
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
