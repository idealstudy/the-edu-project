import { z } from 'zod';

export const MemberSchema = z.object({
  id: z.number().int().nonnegative(),
  email: z.string().email(),
  name: z.string().optional(),
  nickname: z.string().optional(),
  phoneNumber: z.string().optional(),
  // ISO: YYYY-MM-DD
  birthDate: z.string().optional(),
  acceptRequiredTerm: z.boolean().optional(),
  acceptOptionalTerm: z.boolean().optional(),
  role: z.enum(['ROLE_ADMIN', 'ROLE_PARENT', 'ROLE_TEACHER', 'ROLE_STUDENT']),
  // ISO date-time
  regDate: z.string().optional(),
  modDate: z.string().optional(),
});

export const MemberEnvelopeSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  data: MemberSchema,
});

export const MemberAnyResponseSchema = z.union([
  MemberSchema,
  MemberEnvelopeSchema,
]);
