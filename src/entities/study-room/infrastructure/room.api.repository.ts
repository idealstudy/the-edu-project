import type {
  StudentRoomListItemDTO,
  TeacherRoomDetail,
  TeacherRoomDetailDTO,
  TeacherRoomListItemDTO,
} from '@/entities/study-room/types';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types';

import { factory } from '../core/room.factory';
import type { Room, StudentRoom } from '../types';
import { adapters } from './room.adapters';

export const studyRoomRepository = {
  /* ─────────────────────────────────────────────────────
   * 공용
   * ────────────────────────────────────────────────────*/
  getDetail: async (id: number): Promise<TeacherRoomDetail> => {
    const response = await api.private.get<
      CommonResponse<TeacherRoomDetailDTO>
    >(`/study-rooms/${id}`);
    const parsed = adapters.teacher.detail.parse(response.data);
    return factory.teacher.detail(parsed.data);
  },

  /* ─────────────────────────────────────────────────────
   * 선생님
   * ────────────────────────────────────────────────────*/
  teacher: {
    getList: async (): Promise<Room[]> => {
      const response = await api.private.get<
        CommonResponse<TeacherRoomListItemDTO>
      >(`/teacher/study-rooms}`);
      const parsed = adapters.teacher.list.parse(response.data);
      return factory.teacher.list(parsed.data);
    },
  },

  /* ─────────────────────────────────────────────────────
   * 학생
   * ────────────────────────────────────────────────────*/
  student: {
    getList: async (): Promise<StudentRoom[]> => {
      const response =
        await api.private.get<CommonResponse<StudentRoomListItemDTO>>(
          `/student/study-rooms`
        );
      const parsed = adapters.student.list.parse(response.data);
      return factory.student.list(parsed.data);
    },
  },
};
