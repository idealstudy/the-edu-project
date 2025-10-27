import { StudyNoteMemberResponse } from '@/features/studynotes/types';
import type {
  StudyNote,
  StudyNoteGroupPageable,
} from '@/features/studyrooms/components/studynotes/type';
import { CommonResponse, PaginationMeta, apiClient } from '@/lib/api';

export const getStudyNotes = async (args: {
  studyRoomId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = (
    await apiClient.get<
      CommonResponse<PaginationMeta & { content: StudyNote[] }>
    >(`/teacher/study-rooms/${args.studyRoomId}/teaching-notes`, {
      params: {
        page: args.pageable.page,
        size: args.pageable.size,
        sortKey: args.pageable.sortKey,
        // keyword: args.keyword,
      },
    })
  ).data;
  return response.data;
};

export const getStudyNotesByGroupId = async (params: {
  studyRoomId: number;
  teachingNoteGroupId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = await apiClient.get(
    `/teacher/study-rooms/${params.studyRoomId}/teaching-note-groups/${params.teachingNoteGroupId}/teaching-notes`,
    {
      params: {
        page: params.pageable.page,
        size: params.pageable.size,
        sortKey: params.pageable.sortKey,
        // keyword: args.keyword,
      },
    }
  );

  return response.data;
};

export const deleteStudyNoteToGroup = async (args: { studyNoteId: number }) => {
  const response = await apiClient.delete(
    `/teacher/teaching-notes/${args.studyNoteId}/teaching-note-groups`
  );
  return response.data;
};

export const moveStudyNoteToGroup = async (args: {
  studyNoteId: number;
  groupId: number | null;
  studyRoomId: number;
}) => {
  const response = await apiClient.put(
    `/teacher/study-rooms/${args.studyRoomId}/teaching-notes/${args.studyNoteId}/group`,
    {
      groupId: args.groupId,
    }
  );
  return response.data;
};

export const updateStudyNoteGroup = async (args: {
  teachingNoteId: number;
  teachingNoteGroupId: number;
}) => {
  const response = await apiClient.put(
    `/teacher/teaching-notes/${args.teachingNoteId}/teaching-note-groups`,
    {
      teachingNoteGroupId: args.teachingNoteGroupId,
    }
  );
  return response.data;
};

export const updateStudyNote = async (args: {
  teachingNoteId: number;
  studyRoomId: number;
  teachingNoteGroupId: number | null;
  title: string;
  content: string;
  visibility: string;
  taughtAt: string;
  studentIds: number[];
}) => {
  const response = await apiClient.put(
    `/teacher/teaching-notes/${args.teachingNoteId}`,
    {
      studyRoomId: args.studyRoomId,
      teachingNoteGroupId: args.teachingNoteGroupId,
      title: args.title,
      content: args.content,
      visibility: args.visibility,
      taughtAt: args.taughtAt,
      studentIds: args.studentIds,
    }
  );
  return response.data;
};

// 선생님이 스터디룸에 속한 학생들을 조회한다.
export const getStudyNoteMembers = async (args: {
  studyRoomId: number;
  page?: number;
  size?: number;
}): Promise<StudyNoteMemberResponse> => {
  const response = await apiClient.get(
    `/teacher/study-rooms/${args.studyRoomId}/members`,
    {
      params: {
        page: args.page ?? 0,
        size: args.size ?? 20,
      },
    }
  );
  return response.data;
};
