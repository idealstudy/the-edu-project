import {
  InviteFailItemSchema,
  InviteSuccessItemSchema,
  RoomMemberPageSchema,
  StudentRoomListItemSchema,
  StudyRoomInviteRespondDataSchema,
  StudyRoomSearchInviteeDataSchema,
  TeacherRoomCUDResponseDataSchema,
  TeacherRoomDetailSchema,
  TeacherRoomListItemSchema,
} from '@/entities/study-room/infrastructure/room.dto.schema';
import { ApiResponseSchema, EmptyDataSchema } from '@/types';
import { z } from 'zod';

// 선생님 - 목록
export const TeacherRoomListResponseSchema = ApiResponseSchema(
  z.array(TeacherRoomListItemSchema)
);

// 선생님 - 상세
export const TeacherRoomDetailResponseSchema = ApiResponseSchema(
  TeacherRoomDetailSchema
);

// 선생님 - 생성/수정 응답
export const TeacherRoomCUDResponseSchema = ApiResponseSchema(
  TeacherRoomCUDResponseDataSchema
);

// 선생님 - 삭제
export const TeacherRoomDeleteResponseSchema =
  ApiResponseSchema(EmptyDataSchema);

// 선생님 - 멤버 목록
export const RoomMemberListResponseSchema =
  ApiResponseSchema(RoomMemberPageSchema);

// 선생님 - 초대 결과
export const InviteMembersResponseSchema = ApiResponseSchema(
  z.object({
    successEmailList: z.array(InviteSuccessItemSchema),
    failEmailList: z.array(InviteFailItemSchema),
  })
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 멤버 다건 삭제 (DELETE /api/teacher/study-rooms/{id}/members)
 * 단건 삭제 (DELETE /api/teacher/study-rooms/{id}/members/{studentId})
 * ────────────────────────────────────────────────────*/
export const RoomMembersBulkDeleteResponseSchema =
  ApiResponseSchema(EmptyDataSchema);
export const RoomMemberDeleteResponseSchema =
  ApiResponseSchema(EmptyDataSchema);

/* ─────────────────────────────────────────────────────
 * 학생 - 스터디룸 목록 (GET /api/student/study-rooms)
 * ────────────────────────────────────────────────────*/
export const StudentRoomListResponseSchema = ApiResponseSchema(
  z.array(StudentRoomListItemSchema)
);

/* ─────────────────────────────────────────────────────
 * 학생 - 초대 응답
 * ────────────────────────────────────────────────────*/
export const StudyRoomInviteRespondResponseSchema = ApiResponseSchema(
  StudyRoomInviteRespondDataSchema
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 초대 대상 검색
 * ────────────────────────────────────────────────────*/
export const StudyRoomSearchInviteeResponseSchema = ApiResponseSchema(
  StudyRoomSearchInviteeDataSchema
);
