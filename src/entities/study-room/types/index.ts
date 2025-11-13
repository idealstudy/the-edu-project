/* ─────────────────────────────────────────────────────
 * 도메인
 * ────────────────────────────────────────────────────*/
export type { Room, TeacherRoomDetail, StudentRoom } from './room.types';

/* ─────────────────────────────────────────────────────
 * 공통 타입
 * ────────────────────────────────────────────────────*/
export type {
  RoomDTO,
  RoomVisibilityDTO,
  RoomModalityDTO,
  RoomClassFormDTO,
  RoomSchoolLevelDTO,
  RoomSubjectDTO,
} from './room.types';

/* ─────────────────────────────────────────────────────
 * 역할별 타입(선생님, 학생)
 * ────────────────────────────────────────────────────*/
export type {
  TeacherRoomListItemDTO,
  TeacherRoomDetailDTO,
  TeacherRoomCUReqDTO,
  TeacherRoomCUDResDTO,
  StudentRoomListItemDTO,
  RoomMemberPageDTO,
} from './room.types';
