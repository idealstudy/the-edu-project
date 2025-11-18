import { createNotesBaseApi } from '@/features/study-notes/api';
import type {
  StudyNote,
  StudyNoteMemberResponse,
} from '@/features/study-notes/model';
import { api } from '@/shared/api';
import type { PaginationData } from '@/types/http';

export interface TeacherNotesApi
  extends ReturnType<typeof createNotesBaseApi<PaginationData<StudyNote>>> {
  getMembers(args: {
    studyRoomId: number;
    page?: number;
    size?: number;
  }): Promise<StudyNoteMemberResponse>;
  update(args: {
    teachingNoteId: number;
    studyRoomId: number;
    teachingNoteGroupId: number | null;
    title: string;
    content: string;
    visibility: string;
    taughtAt: string;
    studentIds: number[];
  }): Promise<void>;
  moveToGroup(args: {
    studyNoteId: number;
    groupId: number | null;
    studyRoomId: number;
  }): Promise<void>;
  removeFromGroup(args: { studyNoteId: number }): Promise<void>;
}

export type TeacherListResp = PaginationData<StudyNote>;

// NOTE: [선생님 전용] 여기서 확장
export const createTeacherNotesApi = (): TeacherNotesApi => ({
  ...createNotesBaseApi<TeacherListResp>('ROLE_TEACHER'),

  async getMembers({ studyRoomId, page = 0, size = 20 }) {
    return api.private.get(`/teacher/study-rooms/${studyRoomId}/members`, {
      params: { page, size },
    });
  },

  update(args) {
    return api.private.put(
      `/teacher/teaching-notes/${args.teachingNoteId}`,
      args
    );
  },

  moveToGroup({ studyNoteId, groupId, studyRoomId }) {
    return api.private.put(
      `/teacher/study-rooms/${studyRoomId}/teaching-notes/${studyNoteId}/group`,
      { groupId }
    );
  },

  removeFromGroup({ studyNoteId }) {
    return api.private.delete(
      `/teacher/teaching-notes/${studyNoteId}/teaching-note-groups`
    );
  },
});
