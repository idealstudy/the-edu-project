import type { Role } from '@/entities/member';

export type LoginBody = {
  email: string;
  password: string;
};

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
