'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { useStudyNoteDetailQuery } from '@/features/dashboard/studynote/detail/service/query';
import { StudyNoteDetail } from '@/features/dashboard/studynote/detail/type';
import { mergeResolvedContentWithMediaIds } from '@/shared/components/editor';
import { zodResolver } from '@hookform/resolvers/zod';

import { StudyNoteForm, studyNoteFormSchema } from '../schemas/note';

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

  if (isEditMode && (isLoading || !noteDetail)) return <div>로딩 중...</div>;

  return (
    <StudyNoteFormProviderInner
      defaultStudyRoomId={defaultStudyRoomId}
      noteDetail={isEditMode ? noteDetail : undefined}
      isEditMode={isEditMode}
    >
      {children}
    </StudyNoteFormProviderInner>
  );
};

// 폼 초기화 담당
const StudyNoteFormProviderInner = ({
  defaultStudyRoomId,
  noteDetail,
  isEditMode,
  children,
}: {
  defaultStudyRoomId: number;
  noteDetail?: StudyNoteDetail;
  isEditMode: boolean;
  children: React.ReactNode;
}) => {
  const methods = useForm<StudyNoteForm>({
    resolver: zodResolver(studyNoteFormSchema),
    defaultValues:
      isEditMode && noteDetail
        ? computeDefaultValues(noteDetail)
        : {
            title: '',
            content: {},
            studentIds: [],
            studyRoomId: defaultStudyRoomId,
            taughtAt: new Date().toISOString().split('T')[0],
          },
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

function computeDefaultValues(noteDetail: StudyNoteDetail) {
  const rawContentString = noteDetail.content;
  const resolvedContentString = noteDetail.resolvedContent?.content;
  const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };
  const parseContent = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return emptyDoc;
    }
  };

  const rawContent = parseContent(rawContentString);
  const resolvedContent = parseContent(
    resolvedContentString ?? rawContentString
  );

  const content = resolvedContentString
    ? mergeResolvedContentWithMediaIds(rawContent, resolvedContent)
    : rawContent;

  const serverVisibility = noteDetail.visibility;
  const isGuardianVisible =
    serverVisibility === 'SPECIFIC_STUDENTS_AND_PARENTS' ||
    serverVisibility === 'STUDY_ROOM_STUDENTS_AND_PARENTS';
  const visibility =
    serverVisibility === 'SPECIFIC_STUDENTS_AND_PARENTS'
      ? 'SPECIFIC_STUDENTS_ONLY'
      : serverVisibility === 'STUDY_ROOM_STUDENTS_AND_PARENTS'
        ? 'STUDY_ROOM_STUDENTS_ONLY'
        : serverVisibility;

  return {
    title: noteDetail.title,
    content,
    studentIds: noteDetail.studentInfos.map((info) => ({ id: info.studentId })),
    studyRoomId: noteDetail.studyRoomId,
    taughtAt: new Date(noteDetail.taughtAt).toISOString().split('T')[0],
    visibility: visibility as StudyNoteForm['visibility'],
    isGuardianVisible,
    teachingNoteGroupId: noteDetail.groupId ?? undefined,
  };
}
