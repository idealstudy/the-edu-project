import { z } from 'zod';

// 도메인 스키마
export const MemberSchema = z.object({
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
  role: z.enum(['ROLE_ADMIN', 'ROLE_PARENT', 'ROLE_TEACHER', 'ROLE_STUDENT']),
  // ISO date-time
  regDate: z.string().optional().nullable(),
  modDate: z.string().optional().nullable(),
});

// api 응답(envelope 포함) + 도메인으로 변환(.transform)
export const MemberEnvelopeSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  data: MemberSchema,
});

export const MemberAnyResponseSchema = z
  .union([MemberSchema, MemberEnvelopeSchema])
  .nullable()
  .transform((val) => {
    if (val === null) return null;
    return 'data' in val ? val.data : val;
  });
