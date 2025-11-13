import { z } from 'zod';

import {
  RoomClassFormSchema,
  RoomDtoSchema,
  RoomModalitySchema,
  RoomStatsSchema,
  RoomStudentNamesSchema,
  RoomSubjectSchema,
  SchoolInfoSchema,
} from '../infrastructure/room.dto.schema';

/* ─────────────────────────────────────────────────────
 * 기본 스터디룸 도메인(리스트/상세/학생/선생 공통)
 * ────────────────────────────────────────────────────*/
export const RoomDomainSchema = RoomDtoSchema.extend({
  numberOfTeachingNote: RoomStatsSchema.shape.numberOfTeachingNote
    .optional()
    .default(0),

  studentNames: RoomStudentNamesSchema.shape.studentNames
    .optional()
    .default([]),
});

/* ─────────────────────────────────────────────────────
 * 선생님 상세 도메인
 * ────────────────────────────────────────────────────*/
export const TeacherRoomDetailDomainSchema = RoomDomainSchema.extend({
  teacherName: z.string().default(''),
  modality: RoomModalitySchema.optional().default('ONLINE'),
  classForm: RoomClassFormSchema.optional().default('ONE_ON_ONE'),
  subjectType: RoomSubjectSchema.optional().default('OTHER'),
  schoolInfo: SchoolInfoSchema.optional(),
  numberOfQuestion: z.number().int().optional().default(0),
});

/* ─────────────────────────────────────────────────────
 * 학생용 도메인 (필요하면 별도로, 당장은 Room 그대로 써도됨)
 * ────────────────────────────────────────────────────*/
export const StudentRoomDomainSchema = RoomDomainSchema.omit({
  studentNames: true,
}).extend({});
