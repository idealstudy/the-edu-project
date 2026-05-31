import { sharedSchema } from '@/types';
import { z } from 'zod';

import { base } from '../schema';

/* ─────────────────────────────────────────────────────
 * api 응답(DTO 객체)
 * ────────────────────────────────────────────────────*/
const TeacherProfileDtoSchema = base.teacher;
const StudentProfileDtoSchema = base.student;
const ParentProfileDtoSchema = base.parent;

const ProfileDtoSchema = z.union([
  TeacherProfileDtoSchema,
  StudentProfileDtoSchema,
  ParentProfileDtoSchema,
]);

/* ─────────────────────────────────────────────────────
 * api 응답(envelope 포함)
 * ────────────────────────────────────────────────────*/
const ProfileEnvelopeSchema = sharedSchema.response(ProfileDtoSchema);

/* ─────────────────────────────────────────────────────
 * 도메인으로 변환(.transform)
 * ────────────────────────────────────────────────────*/
const ProfileAnyResponseSchema = z
  .union([ProfileDtoSchema, ProfileEnvelopeSchema])
  .nullable()
  .transform((val) => {
    if (val === null) return null;
    return 'data' in val ? val.data : val;
  });

export const dto = {
  teacher: TeacherProfileDtoSchema,
  stuent: StudentProfileDtoSchema,
  parent: ParentProfileDtoSchema,

  schema: ProfileDtoSchema,
  envelope: ProfileEnvelopeSchema,
  response: ProfileAnyResponseSchema,

  role: base.role,
};
