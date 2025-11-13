import { MemberRoleSchema } from '@/entities/member';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * default
 * ────────────────────────────────────────────────────*/
export const RoomVisibilitySchema = z.enum(['PRIVATE', 'PUBLIC']);

export const RoomModalitySchema = z.enum(['ONLINE', 'OFFLINE']);

export const RoomClassFormSchema = z.enum(['ONE_ON_ONE', 'ONE_TO_MANY']);

export const RoomSubjectSchema = z.enum(['KOREAN', 'ENGLISH', 'MATH', 'OTHER']);

export const SchoolLevelSchema = z.enum(['ELEMENTARY', 'MIDDLE', 'HIGH']);

export const SchoolInfoSchema = z.object({
  schoolLevel: SchoolLevelSchema,
  grade: z.number().int().min(1).max(12),
});

export const RoomDtoSchema = z.object({
  id: z.number().int().nonnegative(),
  teacherId: z.number().int().nonnegative(),
  name: z.string(),
  description: z.string(),
  visibility: RoomVisibilitySchema,
});

export const RoomStatsSchema = z.object({
  numberOfTeachingNote: z.number().int(),
});

export const RoomStudentNamesSchema = z.object({
  studentNames: z.array(z.string()),
});

/* ─────────────────────────────────────────────────────
 * 선생님 - 목록 응답 아이템 (GET /api/teacher/study-rooms)
 * ────────────────────────────────────────────────────*/
export const TeacherRoomListItemSchema = RoomDtoSchema.merge(
  RoomStatsSchema
).merge(RoomStudentNamesSchema);

/* ─────────────────────────────────────────────────────
 * 선생님 - 상세 (GET /api/teacher/study-rooms/{id})
 * ────────────────────────────────────────────────────*/
export const TeacherRoomDetailSchema = TeacherRoomListItemSchema.extend({
  teacherName: z.string(),
  modality: RoomModalitySchema,
  classForm: RoomClassFormSchema,
  subjectType: RoomSubjectSchema,
  schoolInfo: SchoolInfoSchema,
  numberOfQuestion: z.number().int(),
});

/* ─────────────────────────────────────────────────────
 * 선생님 - 생성/수정 요청 바디 (POST/PUT /api/teacher/study-rooms)
 * ────────────────────────────────────────────────────*/
export const TeacherRoomCURequestSchema = z.object({
  name: z.string(),
  description: z.string(),
  modality: RoomModalitySchema,
  classForm: RoomClassFormSchema,
  subjectType: RoomSubjectSchema,
  schoolInfo: SchoolInfoSchema,
  visibility: RoomVisibilitySchema,
});

// 생성/수정 응답 예시
export const TeacherRoomCUDResponseDataSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  teacherName: z.string(),
  visibility: RoomVisibilitySchema,
});

/* ─────────────────────────────────────────────────────
 * 선생님 - 멤버 목록 (GET /api/teacher/study-rooms/{id}/members)
 * ────────────────────────────────────────────────────*/
export const RoomMemberItemSchema = z.object({
  studentInfo: z.object({
    role: MemberRoleSchema,
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    joinDate: z.string(),
  }),
  parentInfo: z.object({
    role: MemberRoleSchema,
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    joinDate: z.string(),
  }),
});

export const RoomMemberPageSchema = z.object({
  pageNumber: z.number().int(),
  size: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  members: z.array(RoomMemberItemSchema),
});

/* ─────────────────────────────────────────────────────
 * 선생님 - 멤버 초대 (POST /api/teacher/study-rooms/{id}/members)
 * ────────────────────────────────────────────────────*/
export const InviteSuccessItemSchema = z.object({
  email: z.string(),
  name: z.string(),
  role: MemberRoleSchema,
});

export const InviteFailItemSchema = z.object({
  email: z.string(),
  name: z.string(),
  reason: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 학생 - 스터디룸 목록
 * ────────────────────────────────────────────────────*/
export const StudentRoomListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  teacherId: z.number().int(),
  visibility: RoomVisibilitySchema,
  numberOfTeachingNote: z.number().int(),
});

/* ─────────────────────────────────────────────────────
 * 학생 - 초대 응답
 * ────────────────────────────────────────────────────*/
export const StudyRoomInviteRespondDataSchema = z.object({
  state: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']).catch('PENDING'),
  studyRoomResponse: z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
    teacherName: z.string(),
    visibility: RoomVisibilitySchema,
  }),
});

/* ─────────────────────────────────────────────────────
 * 선생님 - 초대 대상 검색
 * ────────────────────────────────────────────────────*/
export const StudyRoomSearchInviteeDataSchema = z.object({
  role: z.string(),
  canInvite: z.boolean(),
  inviteeId: z.number().int(),
  inviteeEmail: z.string(),
  inviteeName: z.string(),
  connectedGuardianCount: z.number().int(),
  connectedStudentCount: z.number().int(),
  studentResponseList: z.array(z.string()),
});
