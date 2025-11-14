import { Room, RoomFactory, StudentRoom } from '@/entities/study-room';
import type {
  StudentRoomListItemDTO,
  TeacherRoomDetail,
  TeacherRoomDetailDTO,
  TeacherRoomListItemDTO,
} from '@/entities/study-room/types';
import { authApi } from '@/shared/api';
import { CommonResponse } from '@/types';

import {
  RoomDetailResponseAdapter,
  RoomListResponseAdapter,
  StudentRoomListResponseAdapter,
} from './room.adapters';

export const studyRoomRepository = {
  /* ─────────────────────────────────────────────────────
   * 공용
   * ────────────────────────────────────────────────────*/
  getDetail: async (id: number): Promise<TeacherRoomDetail> => {
    const response = await authApi.get<CommonResponse<TeacherRoomDetailDTO>>(
      `/study-rooms/${id}`
    );
    const parsed = RoomDetailResponseAdapter.parse(response.data);
    return RoomFactory.fromTeacherDetail(parsed.data);
  },

  /* ─────────────────────────────────────────────────────
   * 선생님
   * ────────────────────────────────────────────────────*/
  teacher: {
    getList: async (): Promise<Room[]> => {
      const response = await authApi.get<
        CommonResponse<TeacherRoomListItemDTO>
      >(`/teacher/study-rooms}`);
      const parsed = RoomListResponseAdapter.parse(response.data);
      return RoomFactory.fromTeacherList(parsed.data);
    },
  },

  /* ─────────────────────────────────────────────────────
   * 학생
   * ────────────────────────────────────────────────────*/
  student: {
    getList: async (): Promise<StudentRoom[]> => {
      const response =
        await authApi.get<CommonResponse<StudentRoomListItemDTO>>(
          `/student/study-rooms`
        );
      const parsed = StudentRoomListResponseAdapter.parse(response.data);
      return RoomFactory.fromStudentList(parsed.data);
    },
  },
};
