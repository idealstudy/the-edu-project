import { z } from 'zod';

// ADMIN, MEMBER 제외
const ProfileRoleSchema = z.enum([
  'ROLE_TEACHER',
  'ROLE_STUDENT',
  'ROLE_PARENT',
]);

const TeacherProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  profileImageUrl: z.string().nullable(),
  desc: z.string(),
  teacherNoteCount: z.number().int(),
  studentCount: z.number().int(),
  reviewCount: z.number().int(),
});

const StudentProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  profileImageUrl: z.string().nullable(),
  desc: z.string(),
});

const ParentProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  profileImageUrl: z.string().nullable(),
});

export const base = {
  role: ProfileRoleSchema,
  teacher: TeacherProfileSchema,
  student: StudentProfileSchema,
  parent: ParentProfileSchema,
};
