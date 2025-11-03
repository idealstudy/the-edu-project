import { z } from 'zod';

export const MemberInfoSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    nickname: z.string(),
    phoneNumber: z.string(),
    birthDate: z.string().date(),
    acceptRequiredTerm: z.boolean(),
    acceptOptionalTerm: z.boolean(),
    role: z.enum(['ROLE_ADMIN', 'ROLE_USER', 'ROLE_TEACHER', 'ROLE_STUDENT']),
    regDate: z.string(),
    modDate: z.string(),
  }),
});

export type MemberInfo = z.infer<typeof MemberInfoSchema>;
