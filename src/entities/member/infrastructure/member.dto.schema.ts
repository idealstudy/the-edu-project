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

export const dto = {
  schema: MemberDtoSchema,
  envelope: MemberEnvelopeSchema,
  response: MemberAnyResponseSchema,
  role: base.role,
};
