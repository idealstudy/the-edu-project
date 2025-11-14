import { z } from 'zod';

import { member } from '../schema';

const MemberDtoSchema = member.schema;

// api 응답(envelope 포함) + 도메인으로 변환(.transform)
const MemberEnvelopeSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  data: MemberDtoSchema,
});

const MemberAnyResponseSchema = z
  .union([MemberDtoSchema, MemberEnvelopeSchema])
  .nullable()
  .transform((val) => {
    if (val === null) return null;
    return 'data' in val ? val.data : val;
  });

export const dto = {
  member: {
    schema: MemberDtoSchema,
    response: MemberAnyResponseSchema,
    role: member.role,
  },
};
