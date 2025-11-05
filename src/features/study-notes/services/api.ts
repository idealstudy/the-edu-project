import type {
  StudyNote,
  StudyNoteGroupPageable,
} from '@/features/study-notes/type';
import { StudyNoteMemberResponse } from '@/features/study-notes/types';
// import { StudyNoteGroup } from '@/features/study-rooms/types';
import { authApi } from '@/lib/http/api';
import { CommonResponse, PaginationData, PaginationMeta } from '@/types/http';

export const getStudyNotes = async (args: {
  studyRoomId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = await authApi.get<
    CommonResponse<CommonResponse<PaginationData<StudyNote>>>
  >(`/teacher/study-rooms/${args.studyRoomId}/teaching-notes`, {
    params: {
      page: args.pageable.page,
      size: args.pageable.size,
      sortKey: args.pageable.sortKey,
      // keyword: args.keyword,
    },
  });
  return response.data.data;
};

// 선생님이 스터디노트를 그룹별로 조회
export const getStudyNotesByGroupId = async (params: {
  studyRoomId: number;
  teachingNoteGroupId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = await authApi.get<CommonResponse<PaginationData<StudyNote>>>(
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

// 학생이 스터디노트 목록 조회
export const getStudentStudyNotes = async (args: {
  studyRoomId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = await authApi.get<
    CommonResponse<PaginationMeta & { content: StudyNote[] }>
  >(`/student/study-rooms/${args.studyRoomId}/teaching-notes`, {
    params: {
      page: args.pageable.page,
      size: args.pageable.size,
      sortKey: args.pageable.sortKey,
      // keyword: args.keyword,
    },
  });
  return response.data;
};

// 학생이 스터디노트를 그룹별로 조회
export const getStudentStudyNotesByGroupId = async (params: {
  studyRoomId: number;
  teachingNoteGroupId: number;
  pageable: StudyNoteGroupPageable;
  // keyword: string;
}) => {
  const response = await authApi.get<CommonResponse<PaginationData<StudyNote>>>(
    `/student/study-rooms/${params.studyRoomId}/teaching-note-groups/${params.teachingNoteGroupId}/teaching-notes`,
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
  return await authApi.delete(
    `/teacher/teaching-notes/${args.studyNoteId}/teaching-note-groups`
  );
};

export const moveStudyNoteToGroup = async (args: {
  studyNoteId: number;
  groupId: number | null;
  studyRoomId: number;
}) => {
  return await authApi.put(
    `/teacher/study-rooms/${args.studyRoomId}/teaching-notes/${args.studyNoteId}/group`,
    {
      groupId: args.groupId,
    }
  );
};

export const updateStudyNoteGroup = async (args: {
  teachingNoteId: number;
  teachingNoteGroupId: number;
}) => {
  return await authApi.put(
    `/teacher/teaching-notes/${args.teachingNoteId}/teaching-note-groups`,
    {
      teachingNoteGroupId: args.teachingNoteGroupId,
    }
  );
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
  return await authApi.put(`/teacher/teaching-notes/${args.teachingNoteId}`, {
    studyRoomId: args.studyRoomId,
    teachingNoteGroupId: args.teachingNoteGroupId,
    title: args.title,
    content: args.content,
    visibility: args.visibility,
    taughtAt: args.taughtAt,
    studentIds: args.studentIds,
  });
};

// 선생님이 스터디룸에 속한 학생들을 조회한다.
export const getStudyNoteMembers = async (args: {
  studyRoomId: number;
  page?: number;
  size?: number;
}): Promise<StudyNoteMemberResponse> => {
  return await authApi.get(`/teacher/study-rooms/${args.studyRoomId}/members`, {
    params: {
      page: args.page ?? 0,
      size: args.size ?? 20,
    },
  });
};
