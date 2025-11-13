import type { Role } from '@/entities/member';
import { MemberRoleSchema } from '@/entities/member';
import { z } from 'zod';

export type Session = z.infer<typeof Session>;
export const Session = z.object({
  auth: MemberRoleSchema,
  memberId: z.number().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  nickname: z.string().optional(),
});

export type LoginBody = {
  email: string;
  password: string;
};

export const SessionPayload = z.object({
  auth: MemberRoleSchema.optional(),
  role: MemberRoleSchema.optional(),
  memberId: z.number().optional(),
  email: z.string().optional(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
});

export type SessionPayload = z.infer<typeof SessionPayload>;

export type CheckEmailDuplicateBody = {
  email: string;
};

export type VerifyCodeBody = {
  email: string;
  code: string;
};

export type SignUpBody = {
  email: string;
  password: string;
  name: string;
  acceptOptionalTerm: boolean;
  role: Role;
};
