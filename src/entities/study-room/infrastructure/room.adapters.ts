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
import { sharedSchema } from '@/types';
import { z } from 'zod';

// 선생님 - 목록
export const RoomListResponseAdapter = sharedSchema.response(
  z.array(TeacherRoomListItemSchema)
);

// 선생님 - 상세
export const RoomDetailResponseAdapter = sharedSchema.response(
  TeacherRoomDetailSchema
);

// 선생님 - 생성/수정 응답
export const RoomCUDResponseAdapter = sharedSchema.response(
  TeacherRoomCUDResponseDataSchema
);

// 선생님 - 삭제
export const RoomDeleteResponseAdapter = sharedSchema.response(
  sharedSchema.empty
);

// 선생님 - 멤버 목록
export const RoomMemberListResponseAdapter =
  sharedSchema.response(RoomMemberPageSchema);

// 선생님 - 초대 결과
export const InviteMembersResponseAdapter = sharedSchema.response(
  z.object({
    successEmailList: z.array(InviteSuccessItemSchema),
    failEmailList: z.array(InviteFailItemSchema),
  })
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 멤버 다건 삭제 (DELETE /api/teacher/study-rooms/{id}/members)
 * 단건 삭제 (DELETE /api/teacher/study-rooms/{id}/members/{studentId})
 * ────────────────────────────────────────────────────*/
export const RoomMembersBulkDeleteResponseSchema = sharedSchema.response(
  sharedSchema.empty
);
export const RoomMemberDeleteResponseSchema = sharedSchema.response(
  sharedSchema.empty
);

/* ─────────────────────────────────────────────────────
 * 학생 - 스터디룸 목록 (GET /api/student/study-rooms)
 * ────────────────────────────────────────────────────*/
export const StudentRoomListResponseAdapter = sharedSchema.response(
  z.array(StudentRoomListItemSchema)
);

/* ─────────────────────────────────────────────────────
 * 학생 - 초대 응답
 * ────────────────────────────────────────────────────*/
export const StudyRoomInviteRespondResponseAdapter = sharedSchema.response(
  StudyRoomInviteRespondDataSchema
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 초대 대상 검색
 * ────────────────────────────────────────────────────*/
export const StudyRoomSearchInviteeResponseAdapter = sharedSchema.response(
  StudyRoomSearchInviteeDataSchema
);
