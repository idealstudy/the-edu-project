import {
  RoomDomainSchema,
  StudentRoomDomainSchema,
  TeacherRoomDetailDomainSchema,
} from '@/entities/study-room/core/room.domain.schema';
import {
  RoomClassFormSchema,
  RoomDtoSchema,
  RoomMemberPageSchema,
  RoomModalitySchema,
  RoomSubjectSchema,
  RoomVisibilitySchema,
  SchoolLevelSchema,
  StudentRoomListItemSchema,
  TeacherRoomCUDResponseDataSchema,
  TeacherRoomCURequestSchema,
  TeacherRoomDetailSchema,
  TeacherRoomListItemSchema,
} from '@/entities/study-room/infrastructure/room.dto.schema';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * DTO - 공통 타입
 * ────────────────────────────────────────────────────*/
export type RoomDTO = z.infer<typeof RoomDtoSchema>;
export type RoomVisibilityDTO = z.infer<typeof RoomVisibilitySchema>;
export type RoomModalityDTO = z.infer<typeof RoomModalitySchema>;
export type RoomClassFormDTO = z.infer<typeof RoomClassFormSchema>;
export type RoomSchoolLevelDTO = z.infer<typeof SchoolLevelSchema>;
export type RoomSubjectDTO = z.infer<typeof RoomSubjectSchema>;

/* ─────────────────────────────────────────────────────
 * DTO - 선생님 타입
 * ────────────────────────────────────────────────────*/
export type TeacherRoomListItemDTO = z.infer<typeof TeacherRoomListItemSchema>;
export type TeacherRoomDetailDTO = z.infer<typeof TeacherRoomDetailSchema>;
export type TeacherRoomCUReqDTO = z.infer<typeof TeacherRoomCURequestSchema>;
export type TeacherRoomCUDResDTO = z.infer<
  typeof TeacherRoomCUDResponseDataSchema
>;

/* ─────────────────────────────────────────────────────
 * DTO - 학생 타입
 * ────────────────────────────────────────────────────*/
export type StudentRoomListItemDTO = z.infer<typeof StudentRoomListItemSchema>;
export type RoomMemberPageDTO = z.infer<typeof RoomMemberPageSchema>;

/* ─────────────────────────────────────────────────────
 * domain 타입
 * Room: 개별 스터디룸 도메인 타입
 * RoomList: 스터디룸 리스트 도메인 타입 (Room 도메인 객체의 배열)
 * StudentRoom: 개별 학생용 스터디룸 도메인 타입
 * StudentRoomList: 개별 학생용 스터디룸 리스트 도메인 타입
 * ────────────────────────────────────────────────────*/
export type Room = z.infer<typeof RoomDomainSchema>;
export type RoomList = Room[];
export type StudentRoom = z.infer<typeof StudentRoomDomainSchema>;
export type StudentRoomList = StudentRoom[];
export type TeacherRoomDetail = z.infer<typeof TeacherRoomDetailDomainSchema>;
