// 기본 스키마
export {
  RoomVisibilitySchema,
  RoomModalitySchema,
  RoomClassFormSchema,
  RoomSubjectSchema,
  SchoolLevelSchema,
  SchoolInfoSchema,
} from './room.dto.schema';

// 교사용
export {
  TeacherRoomListItemSchema,
  TeacherRoomDetailSchema,
  TeacherRoomCURequestSchema,
  TeacherRoomCUDResponseDataSchema,
} from './room.dto.schema';

// 학생용
export { StudentRoomListItemSchema } from './room.dto.schema';

// 멤버
export { RoomMemberItemSchema, RoomMemberPageSchema } from './room.dto.schema';

// 초대
export {
  InviteSuccessItemSchema,
  InviteFailItemSchema,
  StudyRoomInviteRespondDataSchema,
  StudyRoomSearchInviteeDataSchema,
} from './room.dto.schema';

export { studyRoomsQueryKey } from './room.keys';
export { studyRoomRepository } from './room.api.repository';
