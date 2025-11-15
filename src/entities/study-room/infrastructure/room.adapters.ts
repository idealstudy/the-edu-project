import { sharedSchema } from '@/types';
import { z } from 'zod';

// import { base } from '../infrastructure/room.base.schema';
import { dto } from '../infrastructure/room.dto.schema';

// 선생님 - 목록
const RoomListResponseAdapter = sharedSchema.response(
  z.array(dto.teacher.listItem)
);

// 선생님 - 상세
const RoomDetailResponseAdapter = sharedSchema.response(dto.teacher.detail);

// 선생님 - 생성/수정 응답
const RoomCUDResponseAdapter = sharedSchema.response(dto.teacher.cuResponse);

// 선생님 - 삭제
const RoomDeleteResponseAdapter = sharedSchema.response(sharedSchema.empty);

// 선생님 - 멤버 목록
const RoomMemberListResponseAdapter = sharedSchema.response(
  dto.teacher.memberPage
);

// 선생님 - 초대 결과
const InviteMembersResponseAdapter = sharedSchema.response(
  z.object({
    successEmailList: z.array(dto.teacher.inviteSuccess),
    failEmailList: z.array(dto.teacher.inviteFail).optional(),
  })
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 초대 대상 검색
 * ────────────────────────────────────────────────────*/
const StudyRoomSearchInviteeResponseAdapter = sharedSchema.response(
  dto.search.invitee
);

/* ─────────────────────────────────────────────────────
 * 선생님 - 멤버 다건 삭제 (DELETE /api/teacher/study-rooms/{id}/members)
 * 단건 삭제 (DELETE /api/teacher/study-rooms/{id}/members/{studentId})
 * ────────────────────────────────────────────────────*/
const RoomMembersBulkDeleteResponseSchema = sharedSchema.response(
  sharedSchema.empty
);
const RoomMemberDeleteResponseSchema = sharedSchema.response(
  sharedSchema.empty
);

/* ─────────────────────────────────────────────────────
 * 학생 - 스터디룸 목록 (GET /api/student/study-rooms)
 * ────────────────────────────────────────────────────*/
const StudentRoomListResponseAdapter = sharedSchema.response(
  z.array(dto.student.listItem)
);

/* ─────────────────────────────────────────────────────
 * 학생 - 초대 응답
 * ────────────────────────────────────────────────────*/
const StudyRoomInviteRespondResponseAdapter = sharedSchema.response(
  dto.student.inviteRespond
);

const teacher = {
  list: RoomListResponseAdapter,
  detail: RoomDetailResponseAdapter,
  cu: RoomCUDResponseAdapter,
  remove: RoomDeleteResponseAdapter,
  members: RoomMemberListResponseAdapter,
  invite: InviteMembersResponseAdapter,
  removeMembers: RoomMembersBulkDeleteResponseSchema,
  removeMember: RoomMemberDeleteResponseSchema,
  searchInvitee: StudyRoomSearchInviteeResponseAdapter,
};

const student = {
  list: StudentRoomListResponseAdapter,
  invite: StudyRoomInviteRespondResponseAdapter,
};

export const adapters = {
  teacher,
  student,
};
