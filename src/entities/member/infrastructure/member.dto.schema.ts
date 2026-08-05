import { sharedSchema } from '@/types';
import { z } from 'zod';

import { base } from '../schema';

/* ─────────────────────────────────────────────────────
 * api 응답(DTO 객체)
 * ────────────────────────────────────────────────────*/
const MemberDtoSchema = base.schema;

/* ─────────────────────────────────────────────────────
 * api 응답(envelope 포함)
 * ────────────────────────────────────────────────────*/
const MemberEnvelopeSchema = sharedSchema.response(MemberDtoSchema);

/* ─────────────────────────────────────────────────────
 * 도메인으로 변환(.transform)
 * ────────────────────────────────────────────────────*/
const MemberAnyResponseSchema = z
  .union([MemberDtoSchema, MemberEnvelopeSchema])
  .nullable()
  .transform((val) => {
    if (val === null) return null;
    return 'data' in val ? val.data : val;
  });

const AdminMemberRoleSchema = z.enum(['STUDENT', 'TEACHER', 'PARENT']);

const AdminMemberListItemSchema = z.object({
  memberId: z.number().int().positive(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: AdminMemberRoleSchema,
  signupPath: z.enum(['SELF', 'TEACHER_INVITE', 'OPEN_CHALLENGE']).nullable(),
  signupAt: z.string().datetime().nullable(),
  studyRoomCount: z.number().int().nonnegative(),
  lastActiveAt: z.string().datetime().nullable(),
  isQaAccount: z.boolean(),
  revoked: z.boolean(),
});

const AdminMemberListSchema = z.object({
  content: z.array(AdminMemberListItemSchema),
  totalElements: z.number().int().nonnegative(),
});

const AdminMemberListResponseSchema = sharedSchema.response(
  AdminMemberListSchema
);

export const dto = {
  schema: MemberDtoSchema,
  envelope: MemberEnvelopeSchema,
  response: MemberAnyResponseSchema,
  role: base.role,
  adminRole: AdminMemberRoleSchema,
  adminListItem: AdminMemberListItemSchema,
  adminList: AdminMemberListSchema,
  adminListResponse: AdminMemberListResponseSchema,
};
