import { z } from 'zod';

export const ROLES = ['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_PARENT'] as const;
export type Role = (typeof ROLES)[number];
export const Role = z.enum(ROLES);

export type Session = z.infer<typeof Session>;
export const Session = z.object({
  auth: Role,
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
  auth: Role.optional(),
  role: Role.optional(),
  memberId: z.number().optional(),
  email: z.string().optional(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
});

export type SessionPayload = z.infer<typeof SessionPayload>;

export type CheckEmailDuplicateBody = {
  email: string;
};

export type SendVerificationCodeBody = {
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
