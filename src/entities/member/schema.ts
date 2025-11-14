import { z } from 'zod';

const MemberRoleSchema = z.enum([
  'ROLE_ADMIN',
  'ROLE_PARENT',
  'ROLE_TEACHER',
  'ROLE_STUDENT',
]);

const MemberSchema = z.object({
  id: z.number().int().nonnegative(),
  email: z.string().email(),
  password: z.string().optional(),
  name: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  // ISO: YYYY-MM-DD
  birthDate: z.string().optional().nullable(),
  acceptRequiredTerm: z.boolean().optional().nullable(),
  acceptOptionalTerm: z.boolean().optional().nullable(),
  role: MemberRoleSchema,
  // ISO date-time
  regDate: z.string().optional().nullable(),
  modDate: z.string().optional().nullable(),
});

export const member = {
  role: MemberRoleSchema,
  schema: MemberSchema,
};
